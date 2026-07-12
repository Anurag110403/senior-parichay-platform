const mongoose = require('mongoose');

// User Schema (Admins and Employees)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  name: { type: String, required: true }
});

// Citizen Schema (Enrollments)
const CitizenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  aadharId: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v); // Backend check: Verifies it is exactly 12 digits
      },
      message: props => `${props.value} is not a valid 12-digit Aadhaar number!`
    }
  },
  emergencyContacts: { type: String, required: true },
  photo: { type: String, default: "" },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  qrCodeData: { type: String }, // Base64 QR Image string
  publicLink: { type: String }, // Verification URL

  // New Fields added below 👇
  applicationNo: { type: String, required: true, unique: true },
  applicationDate: { type: Date, default: Date.now, required: true },
  address: { type: String, required: true },
  pincode: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v); // Backend check: Verifies it is exactly 6 digits
      },
      message: props => `${props.value} is not a valid 6-digit pincode!`
    }
  }
});

const User = mongoose.model('User', UserSchema);
const Citizen = mongoose.model('Citizen', CitizenSchema);

module.exports = { User, Citizen };