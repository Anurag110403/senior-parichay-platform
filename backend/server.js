const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
require('dotenv').config();

const { User, Citizen } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // increased limit to allow base64 photo uploads

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        username: "admin",
        password: "admin123",
        name: "Master Admin",
        role: "admin"
      });
      console.log('Seeded default admin user (username: admin / password: admin123)');
    }

    const citizenCount = await Citizen.countDocuments();
    if (citizenCount === 0) {
      const seedCitizen = await Citizen.create({
        name: "Ramesh Kumar",
        dob: new Date("1954-08-15"),
        age: 72,
        bloodGroup: "O+",
        aadharId: "123456789012",
        maskedAadhar: "XXXX-XXXX-9012",
        emergencyContacts: "9876543210",
        personalContact: "9123456780",
        status: "Approved",
        applicationNo: "APP-10001",
        applicationDate: new Date("2026-07-10"),
        address: "123 Main Street, Secunderabad",
        pincode: "500003",
        photo: ""
      });

      seedCitizen.qrCodeData = await QRCode.toDataURL(
        `http://localhost:3000/verify/${seedCitizen._id}`,
        { width: 45, margin: 1 }
      );
      await seedCitizen.save();
      console.log('Seeded default citizen record');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}
seedDatabase();

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      return res.json({ name: user.name, username: user.username, role: user.role });
    }
    return res.status(401).json({ error: "Invalid username or password" });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { requesterRole, username, password, name } = req.body;
    if (requesterRole !== 'admin') {
      return res.status(403).json({ error: "Access denied. Only Admins can create company accounts." });
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: "Username already exists." });
    }
    const newUser = await User.create({ username, password, name, role: 'employee' });
    res.status(201).json({ message: "New user account created successfully", user: { username: newUser.username, name: newUser.name } });
  } catch (err) {
    res.status(500).json({ error: "Server error creating user" });
  }
});

app.get('/api/enrollments', async (req, res) => {
  try {
    const citizens = await Citizen.find();
    res.json(citizens);
  } catch (err) {
    console.error('Enrollments fetch error:', err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

app.get('/api/enrollments/search', async (req, res) => {
  try {
    const record = await Citizen.findOne({ aadharId: req.query.aadharId });
    if (!record) return res.status(404).json({ error: "No profile found." });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const { name, dob, age, bloodGroup, aadharId, emergencyContacts, personalContact, applicationNo, applicationDate, address, pincode, photo } = req.body;
    if (!/^\d{12}$/.test(aadharId)) {
      return res.status(400).json({ error: "Backend Validation Error: Aadhaar card must be exactly 12 digits." });
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Backend Validation Error: Pincode must be exactly 6 digits." });
    }
    const newEntry = await Citizen.create({
      name, dob, age: Number(age) || 60, bloodGroup, aadharId,
      maskedAadhar: `XXXX-XXXX-${aadharId.slice(-4)}`,
      emergencyContacts,
      personalContact,
      status: 'Pending',
      qrCodeData: '',
      applicationNo,
      applicationDate: applicationDate || new Date(),
      address,
      pincode,
      photo: photo || ""
    });
    res.status(200).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to create enrollment", details: err.message });
  }
});

app.put('/api/enrollments/:id', async (req, res) => {
  try {
    const { name, dob, age, bloodGroup, aadharId, emergencyContacts, personalContact, applicationNo, applicationDate, address, pincode, photo } = req.body;
    if (!/^\d{12}$/.test(aadharId)) {
      return res.status(400).json({ error: "Backend Validation Error: Aadhaar card must be exactly 12 digits." });
    }
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Backend Validation Error: Pincode must be exactly 6 digits." });
    }
    const currentItem = await Citizen.findById(req.params.id);
    if (!currentItem) return res.status(404).json({ error: "Record not found" });
    currentItem.name = name;
    currentItem.dob = dob;
    currentItem.age = age;
    currentItem.bloodGroup = bloodGroup;
    currentItem.aadharId = aadharId;
    currentItem.maskedAadhar = `XXXX-XXXX-${aadharId.slice(-4)}`;
    currentItem.emergencyContacts = emergencyContacts;
    currentItem.personalContact = personalContact;
    currentItem.applicationNo = applicationNo;
    currentItem.applicationDate = applicationDate;
    currentItem.address = address;
    currentItem.pincode = pincode;
    currentItem.photo = photo || currentItem.photo;
    if (currentItem.status === 'Approved') {
      currentItem.qrCodeData = await QRCode.toDataURL(`http://localhost:3000/verify/${req.params.id}`, { width: 45, margin: 1 });
    }
    await currentItem.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update enrollment", details: err.message });
  }
});

app.patch('/api/admin/enrollments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Citizen.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Record not found" });
    item.status = status;
    if (status === 'Approved') {
      item.qrCodeData = await QRCode.toDataURL(`http://localhost:3000/verify/${req.params.id}`, { width: 45, margin: 1 });
    } else {
      item.qrCodeData = '';
    }
    await item.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    await Citizen.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete enrollment" });
  }
});

app.get('/api/public/verify/:id', async (req, res) => {
  try {
    const item = await Citizen.findById(req.params.id);
    if (item && item.status === 'Approved') return res.json(item);
    res.status(404).json({ error: "Profile not found or inactive." });
  } catch (err) {
    res.status(404).json({ error: "Profile not found or inactive." });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Database Engine running on port ${PORT}`));