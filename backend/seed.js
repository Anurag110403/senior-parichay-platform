const mongoose = require('mongoose');
// Importing User directly from your models.js file
const { User } = require('./models'); 

// Connect to your local MongoDB database
const MONGO_URI = "mongodb://localhost:27017/proud_senior"; 

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for seeding...");
    
    // Clear out any old test accounts with this email to avoid duplicates
    await User.deleteMany({ email: "admin@test.com" });

    // Create the master Admin user profile
    const adminUser = new User({
      name: "Master Admin",
      email: "admin@test.com",
      password: "password123", 
      role: "admin"
    });

    await adminUser.save();
    console.log("🔥 Success! Admin account created: admin@test.com / password123");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error seeding account:", err);
  });