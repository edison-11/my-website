const SiteContent = require('../models/SiteContent');

const getSiteContent = async (_req, res) => {
  const record = await SiteContent.findOne({ key: 'website' }).lean();
  res.json(record?.content || {});
};

const updateSiteContent = async (req, res) => {
  const content = req.body?.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({ message: 'Content must be an object of text and media settings' });
  }
  const entries = Object.entries(content);
  if (entries.length > 100 || entries.some(([key, value]) => !/^[a-zA-Z][\w.-]{0,79}$/.test(key) || (typeof value !== 'string' && typeof value !== 'boolean') || (typeof value === 'string' && value.length > 5000))) {
    return res.status(400).json({ message: 'Content has an invalid key or value' });
  }
  const record = await SiteContent.findOneAndUpdate(
    { key: 'website' },
    { $set: { content } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json(record.content);
};

module.exports = { getSiteContent, updateSiteContent };
