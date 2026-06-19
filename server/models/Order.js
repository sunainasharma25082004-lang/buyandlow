import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  color: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Razorpay'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: { type: Date },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: { type: Date },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  expectedDeliveryDate: { type: Date },
  deliveryNote: { type: String, default: '' },
  cancelledAt: { type: Date },
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
