require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) throw new Error('Usage: npm run make-admin -- user@example.com');
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true, runValidators: true }
  );
  if (!user) throw new Error(`No account found for ${email}; register that account first.`);
  console.log(`Administrator access enabled for ${user.email}`);
}

makeAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
