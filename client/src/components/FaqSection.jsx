import React, { useState } from 'react';
import './FaqSection.css';

const faqs = [
  {
    q: 'How fast is delivery across India?',
    a: 'We dispatch all orders within 24 business hours from our nearest distribution hub. Metro cities receive deliveries in 2–3 days, while rest of India is delivered within 4–6 business days with live SMS and tracking updates.',
  },
  {
    q: 'Is Cash on Delivery (COD) supported?',
    a: 'Yes! We support Cash on Delivery (COD) across 19,000+ pin codes in India. You can choose COD during checkout and pay securely when the courier arrives at your doorstep.',
  },
  {
    q: 'Are all products on BuyLow India 100% genuine?',
    a: 'Absolutely. Every product in our catalog is directly sourced from certified manufacturers, authorized brand distributors, or vetted producers. We guarantee 100% genuine and original items.',
  },
  {
    q: 'What is the return and replacement policy?',
    a: 'We provide an easy 7-day replacement guarantee. If you receive a damaged, defective, or incorrect product, simply raise a support request from your Orders page and we will arrange a doorstep replacement or prompt refund.',
  },
  {
    q: 'How can I contact customer support?',
    a: 'Our dedicated support team is available every day. You can reach us via email at support@buylowindia.com, or submit a request directly through our Help & Support form on the website.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <span className="faq-tag">❓ HELP &amp; ANSWERS</span>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-sub">
            Everything you need to know about shopping on BuyLow India
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => toggle(index)}
              >
                <div className="faq-question-row">
                  <h3 className="faq-question">{faq.q}</h3>
                  <span className="faq-chevron">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
