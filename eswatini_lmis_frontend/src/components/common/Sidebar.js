import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { path: '/',             label: 'Home',             icon: HomeIcon         },
      { path: '/economic-sectors',   label: 'Economic Sectors', icon: SectorIcon       },
      { path: '/statistics',   label: 'Statistics',       icon: StatsIcon        },
      { path: '/publications', label: 'Publications',     icon: PublicationsIcon },
      { path: '/vacancies',    label: 'Vacancies',        icon: VacancyIcon      },
      { path: '/jobseekers',   label: 'Job Seekers',      icon: JobSeekersIcon   },
      { path: '/career-advice', label: 'Career Advice',   icon: AdviceIcon       },
    ],
  },

];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar__backdrop ${isOpen ? 'sidebar__backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Header */}
        <div className="sidebar__header">
          <span className="sidebar__logo">ELMIS</span>
          <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section} className="sidebar__section">
              <p className="sidebar__section-label">{section}</p>
              {items.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="sidebar__item-icon"><Icon /></span>
                    <span className="sidebar__item-label">{label}</span>
                    {active && <span className="sidebar__item-dot" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar__auth-section">
          <p className="sidebar__section-label">Account</p>
          <div className="sidebar__auth-buttons">
            <Link to="/login" className="sidebar__auth-button" onClick={onClose}>
              <span className="sidebar__auth-icon"><LoginIcon /></span>
              Login
            </Link>
            <Link to="/register" className="sidebar__auth-button sidebar__auth-button--secondary" onClick={onClose}>
              <span className="sidebar__auth-icon"><RegisterIcon /></span>
              Register
            </Link>
          </div>
        </div>

        {/* Footer strip */}
        <div className="sidebar__footer">
          <p className="sidebar__footer-text">
            Ministry of Labour &amp; Social Security
          </p>
          <p className="sidebar__footer-copy">© {new Date().getFullYear()} LMIS</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

/* ── Inline SVG icons ── */
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  );
}

function SectorIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M4 21h16v-2H4v2zm2-4h3V9H6v8zm5 0h3V3h-3v14zm5 0h3v-6h-3v6z"/>
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  );
}
function VacancyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  );
}
function JobSeekersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 11l2 2 4-4"/>
    </svg>
  );
}
function PublicationsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function AdviceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 4.9 4 8.8 7 11.9 3-3.1 7-7 7-11.9 0-3.9-3.1-7-7-7z"/>
      <path d="M12 11v4"/>
      <circle cx="12" cy="7" r="1"/>
    </svg>
  );
}
function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  );
}
function RegisterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}