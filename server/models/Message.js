const mongoose = require('mongoose');

const conversationEntrySchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  senderName: { type: String, required: true, trim: true, maxlength: 100 },
  senderRole: { type: String, enum: ['customer', 'admin'], required: true },
  text: { type: String, trim: true, default: '', maxlength: 5000 },
  attachments: [{ url: { type: String, required: true }, name: { type: String, required: true, maxlength: 255 }, mimeType: { type: String, required: true } }],
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const messageSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, trim: true, default: '', maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  reply: { type: String, trim: true, default: '' },
  conversation: { type: [conversationEntrySchema], default: [] }
}, { timestamps: true, collection: 'messages' });

module.exports = mongoose.model('Message', messageSchema);
