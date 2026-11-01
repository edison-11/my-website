const Category = require('../models/Category');

const getCategories = async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json(categories);
};

const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};

const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category archived' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
