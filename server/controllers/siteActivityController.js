const SiteActivity = require('../models/SiteActivity');

const publicPages = new Set(['home', 'collection', 'gallery', 'about', 'services', 'contact']);
const dayKey = () => new Date().toISOString().slice(0, 10);

const recordPageView = async (req, res) => {
  const page = typeof req.body?.page === 'string' && publicPages.has(req.body.page) ? req.body.page : null;
  if (!page) return res.status(400).json({ message: 'Choose a valid website page' });
  await SiteActivity.findOneAndUpdate({ date: dayKey() }, { $inc: { pageViews: 1, [`pages.${page}`]: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(204).end();
};

const recordShare = async (_req, res) => {
  await SiteActivity.findOneAndUpdate({ date: dayKey() }, { $inc: { shares: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(204).end();
};

const getSummary = async (_req, res) => {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 29);
  const startDate = from.toISOString().slice(0, 10);
  const rows = await SiteActivity.find({ date: { $gte: startDate } }).sort({ date: -1 }).lean();
  const summary = { pageViews: 0, likes: 0, comments: 0, shares: 0, accountCreations: 0, pageCounts: {}, daily: rows.map(({ date, pageViews, likes, comments, shares, accountCreations }) => ({ date, pageViews, likes, comments, shares, accountCreations })) };
  for (const row of rows) {
    summary.pageViews += row.pageViews || 0;
    summary.likes += row.likes || 0;
    summary.comments += row.comments || 0;
    summary.shares += row.shares || 0;
    summary.accountCreations += row.accountCreations || 0;
    for (const [page, count] of Object.entries(row.pages || {})) summary.pageCounts[page] = (summary.pageCounts[page] || 0) + count;
  }
  res.json(summary);
};

module.exports = { recordPageView, recordShare, getSummary };
