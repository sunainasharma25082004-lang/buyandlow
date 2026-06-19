import mongoose from 'mongoose';

const keyFeatureSchema = new mongoose.Schema({
  icon: { type: String },
  title: { type: String, required: true },
  desc: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  image: { type: String, required: true },
  images: [{ type: String }],
  badge: { type: String, default: null },
  category: { type: String, required: true },
  brand: { type: String },
  sku: { type: String, unique: true },
  stock: { type: Number, default: 10 },
  colors: [{ type: String }],
  description: { type: String },
  keyFeatures: [keyFeatureSchema],
  tags: [{ type: String }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
