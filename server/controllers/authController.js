const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SiteActivity = require('../models/SiteActivity');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone
});

const issueToken = (user) => jwt.sign(
  { sub: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1d', issuer: 'my-website-api' }
);

const register = async (req, res) => {
  if (req.body.role === 'admin') {
    return res.status(403).json({ message: 'Create the first administrator using the administrator option on the account form.' });
  }
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ name: req.body.name, email: req.body.email, phone: req.body.phone, passwordHash, role: 'customer' });
  try { await SiteActivity.findOneAndUpdate({ date: new Date().toISOString().slice(0, 10) }, { $inc: { accountCreations: 1 } }, { upsert: true, setDefaultsOnInsert: true }); }
  catch (error) { console.error('Could not record account creation:', error.message); }
  res.status(201).json({ user: publicUser(user), token: issueToken(user) });
};

const createInitialAdmin = async ({ name, email, password }) => {
  const existingAdmin = await User.exists({ role: 'admin', isActive: true });
  if (existingAdmin) {
    const error = new Error('An administrator is already set up. Sign in instead.');
    error.status = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });
  if (user) {
    user.name = name;
    user.passwordHash = passwordHash;
    user.role = 'admin';
    user.isActive = true;
    await user.save();
  } else {
    user = await User.create({ name, email: normalizedEmail, passwordHash, role: 'admin' });
  }
  return { user: publicUser(user), token: issueToken(user) };
};

const login = async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  res.json({ user: publicUser(user), token: issueToken(user) });
};

const getCurrentUser = (req, res) => res.json({ user: publicUser(req.user) });

module.exports = { register, createInitialAdmin, login, getCurrentUser };
