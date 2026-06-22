import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { products } from '../data/products.js';
import { defaultCategories } from '../data/categories.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/adminCredentials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truemart';
    console.log(`Connecting to database at ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('Database connected. Clearing old products...');

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Products and categories cleared.');

    // We will assign a custom String SKU if not already present, and map string IDs or omit them
    // to let Mongoose create ObjectIds automatically.
    const formattedProducts = products.map((p) => {
      // Create copy of product without numeric ID so Mongoose generates ObjectId
      const { id, ...rest } = p;
      return {
        ...rest,
        // Ensure sku matches TC-LW-xxx format or generate one if missing
        sku: p.sku || `TRD-${p.category.toUpperCase().substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
        stock: p.stock !== undefined ? p.stock : 15
      };
    });

    await Product.insertMany(formattedProducts);
    await Category.insertMany(defaultCategories);
    console.log('Successfully seeded database with default products and categories!');

    // Create or update admin user
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
      adminUser.role = 'admin';
      adminUser.password = ADMIN_PASSWORD;
      await adminUser.save();
      console.log(`Admin user updated: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
