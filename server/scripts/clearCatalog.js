import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearCatalog = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truemart';
    console.log(`Connecting to database at ${mongoUri}...`);

    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    const deletedProducts = await Product.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    const deletedReviews = await Review.deleteMany({});

    console.log(`✅ Deleted ${deletedProducts.deletedCount} products`);
    console.log(`✅ Deleted ${deletedCategories.deletedCount} categories`);
    console.log(`✅ Deleted ${deletedReviews.deletedCount} reviews`);

    await mongoose.disconnect();
    console.log('All products and categories cleared successfully from MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear catalog:', error.message);
    process.exit(1);
  }
};

clearCatalog();
