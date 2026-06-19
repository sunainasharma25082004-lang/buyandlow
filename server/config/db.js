import mongoose from 'mongoose';
import { isProduction } from './env.js';

global.isDbConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truemart';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
    });

    global.isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      global.isDbConnected = false;
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      global.isDbConnected = true;
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    global.isDbConnected = false;

    if (isProduction) {
      console.error(`❌ MongoDB connection failed in production: ${error.message}`);
      process.exit(1);
    }

    console.warn(`⚠️  MongoDB unavailable (${error.message}). Running in dev fallback mode.`);
  }
};

export default connectDB;