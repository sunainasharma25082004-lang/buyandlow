import React, { useState, useContext, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './AuthModal.css';

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const AuthModal = () => {
  const { login, loginWithGoogle, register, error, loading } = useContext(AuthContext);
  const { authModalOpen, setAuthModalOpen } = useContext(CartContext);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const googleWrapRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(360);

  useEffect(() => {
    if (!authModalOpen || !googleWrapRef.current) return;

    const updateWidth = () => {
      if (googleWrapRef.current) {
        setGoogleWidth(googleWrapRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [authModalOpen, isLogin]);

  if (!authModalOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      await loginWithGoogle(credentialResponse.credential);
      setName('');
      setEmail('');
      setPassword('');
      setAuthModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email || !password || (!isLogin && !name)) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setName('');
        setEmail('');
        setPassword('');
        setAuthModalOpen(false);
      } else {
        await register(name, email, password);
        const registeredEmail = email;
        setName('');
        setEmail(registeredEmail);
        setPassword('');
        setFormError(null);
        setSuccessMessage('Account created! You can sign in with Google or your password.');
        setIsLogin(true);
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-close-btn" onClick={() => setAuthModalOpen(false)}>
          &times;
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setFormError(null); setSuccessMessage(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setFormError(null); setSuccessMessage(null); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Join buylowindia'}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Continue with Google for instant access — no password needed.'
              : 'Use Google to get started instantly, or create an account with email.'}
          </p>

          {(formError || error) && (
            <div className="auth-error-alert">
              ⚠️ {formError || error}
            </div>
          )}

          {successMessage && (
            <div className="auth-success-alert">
              ✓ {successMessage}
            </div>
          )}

          {GOOGLE_ENABLED && (
            <div className="auth-google-section">
              <div className="auth-google-wrap" ref={googleWrapRef}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setFormError('Google sign-in was cancelled or failed')}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width={googleWidth}
                  locale="en"
                />
              </div>
              <div className="auth-divider">
                <span>or use email</span>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="auth-form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                type="text"
                id="auth-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccessMessage(null); }}
                required
              />
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSuccessMessage(null); }}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSuccessMessage(null); }}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In with Email' : 'Sign Up with Email'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              New here?{' '}
              <span className="auth-toggle-link" onClick={() => { setIsLogin(false); setSuccessMessage(null); setFormError(null); }}>
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span className="auth-toggle-link" onClick={() => { setIsLogin(true); setSuccessMessage(null); setFormError(null); }}>
                Sign in
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;