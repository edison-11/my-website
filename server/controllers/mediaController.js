const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const Media = require('../models/Media');
const SiteActivity = require('../models/SiteActivity');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const recordEngagement = async (field) => {
  try { await SiteActivity.findOneAndUpdate({ date: new Date().toISOString().slice(0, 10) }, { $inc: { [field]: 1 } }, { upsert: true, setDefaultsOnInsert: true }); }
  catch (error) { console.error('Could not record site engagement:', error.message); }
};
const allowedTypes = new Map([
  ['image/jpeg', ['.jpg', 'image']], ['image/png', ['.png', 'image']],
  ['image/webp', ['.webp', 'image']], ['image/gif', ['.gif', 'image']],
  ['video/mp4', ['.mp4', 'video']], ['video/webm', ['.webm', 'video']],
  ['video/ogg', ['.ogv', 'video']], ['video/quicktime', ['.mov', 'video']]
]);

const listMedia = async (_req, res) => {
  res.json(await Media.find({ isActive: true }).sort({ createdAt: -1 }).limit(200));
};

const listPublicMedia = async (_req, res) => {
  res.json(await Media.find({ isActive: true, isPublic: true }).select('originalName description url kind createdAt likes comments').sort({ createdAt: -1 }).lean());
};

const likePublicMedia = async (req, res) => {
  const media = await Media.findOneAndUpdate({ _id: req.params.id, isActive: true, isPublic: true }, { $inc: { likes: 1 } }, { new: true }).select('likes');
  if (!media) return res.status(404).json({ message: 'Published media not found' });
  await recordEngagement('likes');
  res.json({ likes: media.likes });
};

const addPublicComment = async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
  if (!text || text.length > 500) return res.status(400).json({ message: 'Comment must be between 1 and 500 characters' });
  const comment = { name: name || 'Guest', text };
  const media = await Media.findOneAndUpdate({ _id: req.params.id, isActive: true, isPublic: true }, { $push: { comments: { $each: [comment], $slice: -100 } } }, { new: true }).select('comments');
  if (!media) return res.status(404).json({ message: 'Published media not found' });
  await recordEngagement('comments');
  res.status(201).json({ comments: media.comments });
};

const setMediaVisibility = async (req, res) => {
  if (typeof req.body?.isPublic !== 'boolean') {
    return res.status(400).json({ message: 'isPublic must be true or false' });
  }
  const media = await Media.findByIdAndUpdate(
    req.params.id,
    { isPublic: req.body.isPublic },
    { new: true, runValidators: true }
  );
  if (!media) return res.status(404).json({ message: 'Media not found' });
  res.json(media);
};

const updateMediaDescription = async (req, res) => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : null;
  if (description === null) return res.status(400).json({ message: 'Description must be text' });
  if (description.length > 1000) return res.status(400).json({ message: 'Description must be 1000 characters or fewer' });
  const media = await Media.findByIdAndUpdate(req.params.id, { description }, { new: true, runValidators: true });
  if (!media) return res.status(404).json({ message: 'Media not found' });
  res.json(media);
};

const uploadMedia = async (req, res) => {
  const mimeType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const typeInfo = allowedTypes.get(mimeType);
  if (!typeInfo) return res.status(415).json({ message: 'Upload a JPEG, PNG, WebP, GIF, MP4, WebM, OGG, or MOV file' });
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ message: 'The uploaded file is empty' });
  if (req.body.length > 80 * 1024 * 1024) return res.status(413).json({ message: 'Files must be 80 MB or smaller' });

  await fs.mkdir(uploadDirectory, { recursive: true });
  const [extension, kind] = typeInfo;
  const filename = `${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadDirectory, filename);
  await fs.writeFile(filePath, req.body, { flag: 'wx' });
  try {
    const host = process.env.PUBLIC_SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const media = await Media.create({
      originalName: path.basename(String(req.query.filename || `upload${extension}`)).slice(0, 255),
      description: String(req.query.description || '').trim().slice(0, 1000),
      url: `${host.replace(/\/$/, '')}/uploads/${filename}`,
      mimeType,
      kind,
      size: req.body.length
    });
    res.status(201).json(media);
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
};

const archiveMedia = async (req, res) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!media) return res.status(404).json({ message: 'Media not found' });
  res.json({ message: 'Media item archived' });
};

module.exports = { listMedia, listPublicMedia, likePublicMedia, addPublicComment, setMediaVisibility, updateMediaDescription, uploadMedia, archiveMedia };
