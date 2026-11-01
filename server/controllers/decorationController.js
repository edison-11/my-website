const Decoration = require('../models/Decoration');

const listDecorations = async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === 'true') filter.featured = true;
  const decorations = await Decoration.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(decorations);
};

const getDecoration = async (req, res) => {
  const decoration = await Decoration.findById(req.params.id).populate('category', 'name slug');
  if (!decoration || !decoration.isAvailable) return res.status(404).json({ message: 'Decoration not found' });
  res.json(decoration);
};

const createDecoration = async (req, res) => {
  const decoration = await Decoration.create(req.body);
  res.status(201).json(decoration);
};

const updateDecoration = async (req, res) => {
  const decoration = await Decoration.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!decoration) return res.status(404).json({ message: 'Decoration not found' });
  res.json(decoration);
};

const deleteDecoration = async (req, res) => {
  const decoration = await Decoration.findByIdAndUpdate(req.params.id, { isAvailable: false }, { new: true });
  if (!decoration) return res.status(404).json({ message: 'Decoration not found' });
  res.json({ message: 'Decoration archived' });
};

module.exports = { listDecorations, getDecoration, createDecoration, updateDecoration, deleteDecoration };
