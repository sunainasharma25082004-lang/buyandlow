import React from 'react';
import './Logo.css';

const LOGO_SRC = '/logo.png';

const Logo = ({ className = '', size = 'default' }) => (
  <div className={`brand-logo-wrap size-${size} ${className}`}>
    <img src={LOGO_SRC} alt="buylowindia" className="brand-logo-img" />
  </div>
);

export default Logo;