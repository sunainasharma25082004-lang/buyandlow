import React, { useState } from 'react';
import './FaqSection.css';

const faqs = [
  {
    q: 'Where do you deliver and how fast is it?',
    a: 'We currently deliver exclusively in Zirakpur (pincodes 140603 and 140604). Orders are dispatched rapidly and delivered within 24 to 48 hours right to your doorstep.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept 100% secure online payment options powered by Razorpay, including UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, and Netbanking. Please note that Cash on Delivery is not supported.',
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
