import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import footerPages from '../data/footerPages';
import './InfoPage.css';

const InfoPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const page = footerPages[slug];

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  if (!page) {
    return (
      <div className="info-page">
        <div className="container info-body">
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="info-page">
      <div className="info-page-header">
        <div className="container">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>Home</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">{page.title}</span>
          </div>
          <h1 className="info-title">{page.title}</h1>
          <p className="info-subtitle">{page.subtitle}</p>
        </div>
      </div>

      <div className="container info-body">
        <div className="info-content">
          {page.sections.map((section, i) => (
            <section key={i} className="info-section">
              <h2>{section.heading}</h2>
              {section.body && (
                <p className="info-text">{section.body.split('\n').map((line, j) => (
                  <React.Fragment key={j}>{line}{j < section.body.split('\n').length - 1 && <br />}</React.Fragment>
                ))}</p>
              )}
              {section.list && (
                <ul className="info-list">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          {page.showContactForm && (
            <section className="info-section contact-form-section">
              <h2>Send Us a Message</h2>
              {sent ? (
                <div className="form-success">
                  Thank you! Your message has been received. We will get back to you within 24 hours.
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Your message..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn-primary">Send Message</button>
                </form>
              )}
            </section>
          )}

          {page.cta && (
            <div className="info-cta">
              {page.cta.mail ? (
                <a href={`mailto:${page.cta.mail}`} className="btn-primary">{page.cta.label}</a>
              ) : (
                <Link to={page.cta.to} className="btn-primary">{page.cta.label}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;