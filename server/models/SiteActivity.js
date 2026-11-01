const mongoose = require('mongoose');

const siteActivitySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  pageViews: { type: Number, default: 0 },
  pages: { type: Map, of: Number, default: {} },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  accountCreations: { type: Number, default: 0 }
}, { timestamps: true, collection: 'site_activity' });

module.exports = mongoose.model('SiteActivity', siteActivitySchema);
