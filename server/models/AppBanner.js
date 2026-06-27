import mongoose from 'mongoose';

const appBannerSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    default: '/(tabs)/categories',
    trim: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const AppBanner = mongoose.model('AppBanner', appBannerSchema);

export default AppBanner;