const mongoose = require('mongoose');

const decorationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  description: { type: String, trim: true, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String, trim: true }],
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'ZAR', uppercase: true, trim: true },
  stock: { type: Number, default: 0, min: 0 },
  tags: [{ type: String, trim: true, lowercase: true }],
  isAvailable: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true, collection: 'decorations' });

module.exports = mongoose.model('Decoration', decorationSchema);
