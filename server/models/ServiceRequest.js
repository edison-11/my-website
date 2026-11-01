const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  serviceType: { type: String, required: true, trim: true, maxlength: 100 },
  eventDate: { type: Date, default: null },
  eventLocation: { type: String, trim: true, default: '' },
  budget: { type: Number, min: 0, default: null },
  details: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'in-progress', 'quoted', 'accepted', 'completed', 'cancelled'], default: 'new' }
}, { timestamps: true, collection: 'serviceRequests' });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
