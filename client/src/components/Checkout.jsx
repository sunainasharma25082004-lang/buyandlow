import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API_URL, { resolveMediaUrl } from '../config/api';
import { formatINR, FREE_SHIPPING_MIN, SHIPPING_FEE } from '../utils/currency';
import { isDeliveryAllowed, DELIVERY_CONFIG } from '../config/deliveryConfig';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { cartItems, getCartTotal, clearCart, setAuthModalOpen } = useContext(CartContext);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Zirakpur');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState(false); // For checkout summary/mock choice
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const paymentMethod = 'Razorpay';

  // Dynamic script loading for Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAuthModalOpen(true);
      navigate('/allproducts', { state: { message: 'Please sign in to complete checkout' } });
      return;
    }
  }, [navigate, user, authLoading, setAuthModalOpen]);

  const itemsPrice = getCartTotal();
  const shippingPrice = itemsPrice >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const totalPrice = itemsPrice + shippingPrice;

  if (cartItems.length === 0 && !createdOrderData) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: '400px', marginBottom: '24px' }}>
            You don't have any items in your cart to checkout. Add items from our catalogue to proceed.
          </p>
          <button className="btn-primary" onClick={() => navigate('/allproducts')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!address || !city || !postalCode || !phone) {
      setError('Please fill in all shipping details');
      setLoading(false);
      return;
    }

    if (!isDeliveryAllowed(city, postalCode)) {
      setError(DELIVERY_CONFIG.errorMessage);
      setLoading(false);
      return;
    }

    try {
      const orderItems = cartItems.map(item => ({
        product: item.product._id || item.product.id || item.product,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        color: item.color,
        quantity: item.quantity
      }));

      const shippingAddress = { address, city: city.trim(), postalCode: postalCode.trim(), country, phone: phone.trim() };

      // 1. Create order on backend
      const res = await axios.post(`${API_URL}/orders`, {
        orderItems,
        shippingAddress,
        itemsPrice,
        shippingPrice,
        totalPrice,
        paymentMethod: 'Razorpay',
      });

      setCreatedOrderData(res.data);
      setPaymentStep(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setError(null);
    setLoading(true);

    try {
      const { order, razorpayOrderId, amount, currency, key_id, simulated } = createdOrderData;

      if (simulated) {
        // Razorpay keys are missing on backend. Let's do a mock success checkout.
        alert('Notice: Razorpay Keys are not configured on the backend. Simulating payment confirmation...');
        
        const verifyRes = await axios.post(`${API_URL}/orders/verify`, {
          razorpayOrderId,
          simulated: true
        });

        if (verifyRes.data.success) {
          clearCart();
          navigate('/orders', { state: { successMessage: 'Order Placed Successfully! (Simulated Mode)' } });
        } else {
          setError('Simulated payment verification failed.');
        }
        setLoading(false);
        return;
      }

      // Load Razorpay checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Configure Razorpay Options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'BuyLow India',
        description: 'Secure Order Payment',
        image: '/assets/logo.png',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyRes = await axios.post(`${API_URL}/orders/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate('/orders', { state: { successMessage: 'Order Placed and Paid Successfully!' } });
            } else {
              setError(verifyRes.data.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            setError(verifyErr.response?.data?.message || 'Payment verification failed. If money was deducted, our team will verify and confirm your order shortly.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment window was closed before completion. Tap "Proceed to Online Payment" to try again.');
          }
        },
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : '',
          contact: phone
        },
        theme: {
          color: '#E50914'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setLoading(false);
        setError(`Payment Failed: ${response.error?.description || 'Transaction declined by bank/gateway.'}`);
      });
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError('An error occurred during payment setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="breadcrumb-bar">
        <div className="container">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container checkout-body">
        <h1 className="checkout-page-title">Secure Checkout</h1>

        {error && <div className="checkout-error-alert">⚠️ {error}</div>}

        <div className="checkout-layout">
          {/* Main Form Area */}
          <div className="checkout-main">
            {!paymentStep ? (
              <form onSubmit={handlePlaceOrder} className="shipping-form">
                <h2 className="section-subtitle">Shipping Address</h2>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value="India"
                      readOnly
                      disabled
                      style={{ background: 'var(--surface-soft)', color: 'var(--text-mid)', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    placeholder="House number, street name, apartment"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Town / City</label>
                    <input
                      type="text"
                      placeholder="Zirakpur"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                    <small style={{ fontSize: '11px', color: '#b8860b', marginTop: '4px', display: 'block' }}>
                      📍 Delivery is currently available exclusively in Zirakpur.
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Postal Code / ZIP</label>
                    <input
                      type="text"
                      placeholder="140603 or 140604"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group payment-method-selector-group">
                  <label>Payment Method</label>
                  <div className="payment-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '4px' }}>
                    <div
                      className="payment-option-card selected"
                      style={{
                        border: '2px solid #b8860b',
                        background: 'rgba(184, 134, 11, 0.06)',
                        padding: '14px',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13.5px', color: 'var(--brown-dark)' }}>
                        <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                        <span>💳 Online Payment (Razorpay Secure Gateway)</span>
                      </div>
                      <p style={{ margin: '6px 0 0 24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking
                      </p>
                    </div>
                  </div>
                </div>

                <button type="submit" className="place-order-btn btn-dark" disabled={loading}>
                  {loading ? 'Processing...' : 'Proceed to Online Payment →'}
                </button>
              </form>
            ) : (
              <div className="payment-gateway-step">
                <h2 className="section-subtitle">Complete Your Payment</h2>
                <div className="payment-card">
                  <p className="payment-method-desc">
                    We process all major cards, UPI, and bank transfers safely using <strong>Razorpay Secure Gateway</strong>.
                  </p>
                  <div className="order-details-card">
                    <p><strong>Order ID:</strong> {createdOrderData.order._id}</p>
                    <p><strong>Razorpay Order Reference:</strong> {createdOrderData.razorpayOrderId}</p>
                    <p><strong>Amount:</strong> {formatINR(totalPrice)}</p>
                  </div>

                  <button className="pay-now-btn btn-primary" onClick={handlePayment} disabled={loading}>
                    {loading ? 'Initializing payment...' : '💳 Pay with Razorpay'}
                  </button>

                  <button className="btn-outline back-btn" onClick={() => setPaymentStep(false)} disabled={loading}>
                    Modify Shipping Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar Summary */}
          <aside className="checkout-summary-sidebar">
            <h3 className="sidebar-title">Order Summary</h3>
            
            <div className="summary-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="summary-item-card">
                  <img src={resolveMediaUrl(item.product.image)} alt={item.product.name} />
                  <div className="item-info">
                    <h4 className="item-name">{item.product.name}</h4>
                    <span className="item-meta">Qty: {item.quantity} {item.color ? `| Color: ` : ''}</span>
                    {item.color && (
                      <span className="color-dot" style={{ backgroundColor: item.color }} />
                    )}
                  </div>
                  <span className="item-price">{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals-block">
              <div className="totals-row">
                <span>Items Subtotal</span>
                <span>{formatINR(itemsPrice)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : formatINR(shippingPrice)}</span>
              </div>
              <hr />
              <div className="totals-row final-total">
                <span>Total Amount</span>
                <span>{formatINR(totalPrice)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
