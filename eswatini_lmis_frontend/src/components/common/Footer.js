// ==========================================
// FILE: Footer.js
// PROJECT: eswatini_lmis_frontend
// DESCRIPTION: Global Footer Component (Compact Version)
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTwitter, 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope
} from 'react-icons/fa';

/**
 * Footer Component
 * Provides organizational information and contact details.
 * Updated to a compact size.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  const footerColumns = [
    {
      heading: 'Explore',
      links: [
        { to: '/',            label: 'Home'          },
        { to: '/economic-sectors',   label: 'Economic Sectors'    },
        { to: '/statistics',   label: 'Statistics'    },
        { to: '/publications', label: 'Publications'  },
        { to: '/career-advice', label: 'Career Advice' },
        { to: '/vacancies',    label: 'Job Vacancies' },
        { to: '/jobseekers',   label: 'Job Seekers'   },
        { to: '/faqs',         label: 'FAQs'          },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { to: '/publications', label: 'Reports & Data'    },
        { to: '/statistics',   label: 'Labour Indicators' },
        { to: '/api-docs',     label: 'API Documentation' },
        { to: '/publications', label: 'Open Data Portal'  },
        { href: 'mailto:lmis@gov.sz',  label: 'Enquiries'         },
        { to: '/about',        label: 'About Us'          },
      ],
    },
  ];

  return (
    <footer className="lmis-footer">
      <div className="footer-top-accent" />

      <div className="footer-main-content">
        <div className="footer-container">
          
          {/* COLUMN 1: BRANDING */}
          <div className="footer-column brand-info">
            <div className="footer-logo-wrapper">
              <span className="footer-logo-text">ELMIS</span>
            </div>
            <p className="footer-tagline">
              Labour Market Information System
            </p>
            <p className="footer-desc">
              Providing accurate, timely, and accessible labour market data across 
              the Kingdom of Eswatini.
            </p>
            <div className="footer-ministry-badge">
              <strong>Ministry of Labour &amp; Social Security</strong>
              <p>Kingdom of Eswatini</p>
            </div>
          </div>

          {/* COLUMN 2 & 3: QUICK LINKS */}
          <div className="footer-links-wrapper">
            {footerColumns.map((col, idx) => (
              <div key={idx} className="footer-column">
                <h4 className="footer-heading">{col.heading}</h4>
                <ul className="footer-list">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx} className="footer-list-item">
                      {link.to ? (
                        <Link to={link.to} className="footer-link-action">{link.label}</Link>
                      ) : (
                        <a href={link.href} className="footer-link-action">{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* COLUMN 4: CONTACT */}
          <div className="footer-column contact-details">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact-block">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Mhlambanyatsi+Road,+Mbabane"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mhlambanyatsi Road, Mbabane
                  </a>
                </p>
              </div>
              <div className="contact-item">
                <FaPhoneAlt className="contact-icon" />
                <p>+268 2404 1971</p>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <p>
                  <a href="mailto:lmis@gov.sz">
                    lmis@gov.sz
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 5: SOCIALS */}
          <div className="footer-column social-integration">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="footer-social-grid">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER BOTTOM BAR */}
      <div className="footer-legal-bar">
        <div className="footer-container bottom-inner">
          <p className="copyright-text">
            © {year} <strong>ELMIS</strong> — Eswatini.
          </p>
          <div className="legal-links">
            <Link to="/privacy">Privacy</Link>
            <span className="sep">|</span>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>

      <style>{`
        .lmis-footer {
          background-color: #FFFFFF;
          color: #10c1d8;
          font-family: 'Inter', sans-serif;
          border-top: 1px solid #E2E8F0;
        }

        .footer-top-accent {
          height: 3px;
          background: linear-gradient(90deg, #13A4C9 0%, #10B981 100%);
        }

        .footer-main-content {
          padding: 40px 0 30px 0; /* Reduced from 80/60 */
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 25px; /* Reduced gap */
        }

        .footer-column {
          flex: 1;
          min-width: 200px;
        }

        .brand-info {
          flex: 1.2;
        }

        .footer-logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 24px; /* Reduced from 32 */
          font-weight: 800;
          color: #13c9e9;
        }

        .footer-tagline {
          font-size: 12px; /* Reduced from 14 */
          font-weight: 600;
          color: #c5d1e0;
          margin: 2px 0 12px 0;
          text-transform: uppercase;
        }

        .footer-desc {
          font-size: 13px; /* Reduced from 15 */
          line-height: 1.5;
          color: #eef0f3;
          margin-bottom: 15px;
        }

        .footer-ministry-badge {
          padding: 8px 12px;
          background: #aac6e2;
          border-left: 3px solid #13A4C9;
          border-radius: 4px;
        }

        .footer-ministry-badge strong {
          display: block;
          font-size: 12px;
          color: #031744;
        }

        .footer-ministry-badge p {
          font-size: 11px;
          color: #0713bb;
        }

        .footer-links-wrapper {
          display: flex;
          gap: 20px;
          flex: 1.5;
        }

        .footer-heading {
          font-size: 15px; /* Reduced from 18 */
          font-weight: 700;
          color: #11e7ee;
          margin-bottom: 15px;
        }

        .footer-list-item {
          margin-bottom: 8px; /* Reduced spacing */
        }

        .footer-link-action {
          text-decoration: none;
          color: #ffffff;
          font-size: 13px;
        }

        .contact-item {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .contact-icon {
          color: #13A4C9;
          font-size: 14px;
        }

        .contact-item p {
          font-size: 13px;
          color: #fcfdff;
          margin: 0;
        }

        .footer-social-grid {
          display: flex;
          gap: 10px;
        }

        .social-icon-btn {
          width: 36px;  /* Reduced from 48 */
          height: 36px; /* Reduced from 48 */
          background: #0c6ce2;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 16px;
          transition: all 0.2s;
        }

        .footer-legal-bar {
          background: #F8FAFC;
          padding: 15px 0; /* Reduced from 30 */
        }

        .copyright-text {
          font-size: 12px;
          color: #000205;
        }

        .legal-links a {
          font-size: 12px;
          color: #010307;
        }

        @media (max-width: 768px) {
          .footer-container { flex-direction: column; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;