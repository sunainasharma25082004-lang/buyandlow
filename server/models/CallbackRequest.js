import mongoose from 'mongoose';

const callbackRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestType: {
    type: String,
    enum: ['callback', 'chat'],
    default: 'callback',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  preferredTime: {
    type: String,
    trim: true,
    default: '',
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  chatSummary: {
    type: String,
    trim: true,
    maxlength: 3000,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'resolved'],
    default: 'pending',
  },
  source: {
    type: String,
    default: 'mobile_app',
  },
}, {
  timestamps: true,
});

const CallbackRequest = mongoose.model('CallbackRequest', callbackRequestSchema);

export default CallbackRequest;