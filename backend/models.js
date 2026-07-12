const mongoose = require('mongoose');

// Counter Schema (for auto-incrementing Unique IDs like A00001, A00002...)
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

// User Schema (Admins and Employees)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  name: { type: String, required: true },
  designation: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' }
}, { timestamps: true });

// Citizen Schema (Enrollments)
const CitizenSchema = new mongoose.Schema({
  verificationUrl: { type: String },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  aadharId: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit Aadhaar number!`
    }
  },
  emergencyContacts: { type: String, required: true },
  personalContact: { type: String, default: "" },
  photo: { type: String, default: "" },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  qrCodeData: { type: String },
  publicLink: { type: String },

  uniqueId: { type: String, unique: true },

  // Made optional to match the frontend, which doesn't force these
  applicationNo: { type: String },
  applicationDate: { type: Date, default: Date.now },
  address: { type: String },
  pincode: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{6}$/.test(v); // allow empty, but if present must be 6 digits
      },
      message: props => `${props.value} is not a valid 6-digit pincode!`
    }
  }
});

const User = mongoose.model('User', UserSchema);
const Citizen = mongoose.model('Citizen', CitizenSchema);

module.exports = { User, Citizen, Counter };