const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  originalName: { type: String, required: true, trim: true, maxlength: 255 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  url: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  kind: { type: String, enum: ['image', 'video'], required: true },
  size: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
  likes: { type: Number, default: 0, min: 0 },
  comments: [{ name: { type: String, trim: true, maxlength: 60, default: 'Guest' }, text: { type: String, trim: true, maxlength: 500, required: true }, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true, collection: 'media' });

module.exports = mongoose.model('Media', mediaSchema);
