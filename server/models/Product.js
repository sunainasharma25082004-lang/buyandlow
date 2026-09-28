import mongoose from 'mongoose';

const keyFeatureSchema = new mongoose.Schema({
  icon: { type: String },
  title: { type: String, required: true },
  desc: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, default: 0 },
  oldPrice: { type: Number, default: null },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  images: [{ type: String }],
  badge: { type: String, default: null },
  category: { type: String, default: 'General' },
  subcategory: { type: String, default: '', trim: true },
  brand: { type: String, default: 'Truemart' },
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 10 },
  colors: [{ type: String }],
  description: { type: String, default: '' },
  keyFeatures: [keyFeatureSchema],
  tags: [{ type: String }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
