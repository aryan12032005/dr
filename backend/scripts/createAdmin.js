require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const run = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_STRING, { dbName: 'Library' });
    console.log('Connected to MongoDB for seeding:', conn.connection.host);

    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin user already exists:', existing.username);
      process.exit(0);
    }

    const admin = new User({
      email: 'admin@local',
      username: 'admin',
      password: 'qwerty123',
      first_name: 'Admin',
      last_name: 'User',
      phone_number: '',
      dep_code: '',
      is_faculty: false,
      is_admin: true,
      is_allowed: true
    });

    await admin.save();
    console.log('Admin user created: username=admin password=qwerty123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message || err);
    process.exit(1);
  }
};

run();
