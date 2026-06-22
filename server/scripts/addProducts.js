import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { products } from '../data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const addProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truemart';
    await mongoose.connect(mongoUri);

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const { id, ...rest } = product;
      const payload = {
        ...rest,
        sku: product.sku || `TRD-${product.category?.toUpperCase().substring(0, 3)}-${id}`,
        stock: product.stock !== undefined ? product.stock : 15,
      };

      const exists = await Product.findOne({ sku: payload.sku });
      if (exists) {
        skipped += 1;
        continue;
      }

      await Product.create(payload);
      added += 1;
    }

    const total = await Product.countDocuments();
    console.log(`Done — added ${added} products, skipped ${skipped} existing.`);
    console.log(`Total products in database: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Add products failed:', error);
    process.exit(1);
  }
};

addProducts();