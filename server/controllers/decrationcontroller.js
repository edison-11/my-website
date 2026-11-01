const decoration = require('../models/decoration');
const Category = require('../models/decoration');

const getdecorationes = async (_req, res) => {
  const decorations = await decoration.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json(decorations);
};

module.exports = { getdecorationes };
