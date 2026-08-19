import React from 'react';
import logoImg from '../assets/logo.png';
import './Logo.css';

const Logo = ({ className = '', size = 'default' }) => (
  <div className={`brand-logo-wrap size-${size} ${className}`}>
    <img src={logoImg} alt="buylowindia" className="brand-logo-img" />
  </div>
);

export default Logo;