const Message = require('../models/Message');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const imageTypes = new Map([
  ['image/jpeg', '.jpg'], ['image/png', '.png'],
  ['image/webp', '.webp'], ['image/gif', '.gif']
]);

const createMessage = async (req, res) => {
  const { name, email, subject, message: messageText } = req.body;
  const message = await Message.create({ name, email, subject, message: messageText });
  res.status(201).json({ message: 'Message received', id: message._id });
};

const createCustomerMessage = async (req, res) => {
  const message = await Message.create({
    customer: req.user._id,
    name: req.user.name,
    email: req.user.email,
    subject: req.body.subject,
    message: req.body.message
  });
  res.status(201).json(message);
};

const addCustomerReply = async (req, res) => {
  const text = String(req.body?.message || '').trim();
  if (!text) return res.status(400).json({ message: 'Write a message before sending.' });
  const message = await Message.findOne({ _id: req.params.id, customer: req.user._id });
  if (!message) return res.status(404).json({ message: 'Conversation not found.' });
  message.conversation.push({ sender: req.user._id, senderName: req.user.name, senderRole: 'customer', text });
  message.status = 'unread';
  await message.save();
  res.status(201).json(message);
};

const addAdminReply = async (req, res) => {
  const text = String(req.body?.message || '').trim();
  if (!text) return res.status(400).json({ message: 'Write a message before sending.' });
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Conversation not found.' });
  message.conversation.push({ sender: req.user._id, senderName: req.user.name, senderRole: 'admin', text });
  message.status = 'replied';
  message.reply = text;
  await message.save();
  res.status(201).json(message);
};

const attachImage = async (req, res, role) => {
  const mimeType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const extension = imageTypes.get(mimeType);
  if (!extension) return res.status(415).json({ message: 'Attach a JPEG, PNG, WebP, or GIF image.' });
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ message: 'The selected image is empty.' });
  if (req.body.length > 12 * 1024 * 1024) return res.status(413).json({ message: 'Each image must be 12 MB or smaller.' });

  const query = role === 'customer' ? { _id: req.params.id, customer: req.user._id } : { _id: req.params.id };
  const message = await Message.findOne(query);
  if (!message) return res.status(404).json({ message: 'Conversation not found.' });

  await fs.mkdir(uploadDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadDirectory, filename);
  await fs.writeFile(filePath, req.body, { flag: 'wx' });
  try {
    const host = process.env.PUBLIC_SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const entry = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: role,
      text: '',
      attachments: [{ url: `${host.replace(/\/$/, '')}/uploads/${filename}`, name: path.basename(String(req.query.filename || `image${extension}`)).slice(0, 255), mimeType }]
    };
    const last = message.conversation.at(-1);
    if (last && String(last.sender) === String(req.user._id) && last.senderRole === role && last.attachments.length < 10 && Date.now() - last.createdAt.getTime() < 10 * 60 * 1000) {
      last.attachments.push(...entry.attachments);
    } else {
      message.conversation.push(entry);
    }
    message.status = role === 'customer' ? 'unread' : 'replied';
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
};

const attachCustomerImage = (req, res) => attachImage(req, res, 'customer');
const attachAdminImage = (req, res) => attachImage(req, res, 'admin');

const listCustomerMessages = async (req, res) => {
  res.json(await Message.find({ customer: req.user._id }).sort({ updatedAt: -1 }).limit(100));
};

const listMessages = async (_req, res) => {
  res.json(await Message.find().sort({ updatedAt: -1 }).limit(100));
};

const updateMessage = async (req, res) => {
  const { status, reply } = req.body;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (reply !== undefined) updates.reply = reply;
  const message = await Message.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

module.exports = { createMessage, createCustomerMessage, addCustomerReply, addAdminReply, attachCustomerImage, attachAdminImage, listCustomerMessages, listMessages, updateMessage };
