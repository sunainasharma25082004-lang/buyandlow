import Category from '../models/Category.js';
import { defaultCategories } from '../data/categories.js';

const seedCategoriesIfEmpty = async () => {
  if (!global.isDbConnected) return;

  try {
    const count = await Category.countDocuments();
    if (count > 0) return;

    await Category.insertMany(defaultCategories);
    console.log('✅ Default categories seeded');
  } catch (error) {
    console.warn(`⚠️  Could not seed categories: ${error.message}`);
  }
};

export default seedCategoriesIfEmpty;