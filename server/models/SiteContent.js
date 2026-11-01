const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'website' },
  content: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, collection: 'siteContent' });

module.exports = mongoose.model('SiteContent', siteContentSchema);
