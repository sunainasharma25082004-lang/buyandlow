import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  },
  description: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  showOnHome: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

categorySchema.virtual('displayName').get(function displayName() {
  return this.title || this.name;
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;