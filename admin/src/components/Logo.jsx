import React from 'react';
import logoImg from '../assets/logo/image.png';
import './Logo.css';

const Logo = ({ className = '', size = 'default' }) => (
  <div className={`brand-logo-wrap size-${size} ${className}`}>
    <img src={logoImg} alt="Truemart" className="brand-logo-img" />
  </div>
);

export default Logo;