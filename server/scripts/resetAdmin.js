import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/adminCredentials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resetAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truemart';
    await mongoose.connect(mongoUri);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    let adminUser = await User.findOne({ email });

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('Admin user created.');
    } else {
      adminUser.name = 'Admin';
      adminUser.role = 'admin';
      adminUser.password = ADMIN_PASSWORD;
      await adminUser.save();
      console.log('Admin user reset.');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Admin reset failed:', error);
    process.exit(1);
  }
};

resetAdmin();