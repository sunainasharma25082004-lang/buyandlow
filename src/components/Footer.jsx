import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Footer.css';

const shopLinks = [
  { label: 'New Arrivals', to: '/allproducts?sort=Newest&title=New Arrivals&desc=Discover our latest handcrafted additions' },
  { label: 'Featured Products', to: '/allproducts?sort=Featured&title=Featured Products&desc=Handpicked favourites from our curators' },
  { label: 'Summer Collection', to: '/allproducts?category=Fashion&sort=Newest&title=Summer Collection&desc=Light, stylish picks for the season' },
  { label: 'Best Sellers', to: '/allproducts?sort=Best Rating&title=Best Sellers&desc=Top-rated products loved by our customers' },
  { label: 'Sale Items', to: '/allproducts?sale=true&title=Sale Items&desc=Great deals on premium products' },
];

const companyLinks = [
  { label: 'About Us', to: '/page/about-us' },
  { label: 'Our Story', to: '/page/our-story' },
  { label: 'Careers', to: '/page/careers' },
  { label: 'Press', to: '/page/press' },
  { label: 'Blog', to: '/page/blog' },
];

const supportLinks = [
  { label: 'Help Center', to: '/page/help-center' },
  { label: 'Track Order', to: '/orders' },
  { label: 'Returns & Refunds', to: '/page/returns-refunds' },
  { label: 'Contact Us', to: '/page/contact-us' },
  { label: 'Shipping Info', to: '/page/shipping-info' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/page/privacy-policy' },
  { label: 'Terms of Service', to: '/page/terms-of-service' },
  { label: 'Cookie Policy', to: '/page/cookie-policy' },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo size="lg" />
            </div>
            <p className="footer-tagline">
              Bringing premium handcrafted products from around the world directly to your doorstep.
            </p>
            <div className="social-links">
              {['Facebook', 'Instagram', 'Twitter', 'Pinterest'].map((s) => (
                <a key={s} href={`https://${s.toLowerCase()}.com`} target="_blank" rel="noreferrer" className="social-link" title={s}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              {shopLinks.map((l) => (
                <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              {companyLinks.map((l) => (
                <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              {supportLinks.map((l) => (
                <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Truemart. All rights reserved.</p>
          <div className="footer-legal">
            {legalLinks.map((l) => (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;