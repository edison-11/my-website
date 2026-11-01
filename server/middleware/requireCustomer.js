module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') return res.status(403).json({ message: 'Customer account required' });
  next();
};
