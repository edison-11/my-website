const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Store only a bcrypt hash; the auth controller never returns this field.
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);
