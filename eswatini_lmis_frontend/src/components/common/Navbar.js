import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {

  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [

  {
    path: '/',
    label: 'Home',
    icon: <HomeIcon />
  },

  {
    path: '/economic-sectors',
    label: 'Economic Sectors',
    icon: <SectorIcon />
  },

  {
    path: '/statistics',
    label: 'Statistics',
    icon: <StatsIcon />
  },

  {
    path: '/publications',
    label: 'Publications',
    icon: <PublicationsIcon />
  },
  {
    path: '/vacancies',
    label: 'Vacancies',
    icon: <VacancyIcon />
  },

  {
    path: '/jobseekers',
    label: 'Job Seekers',
    icon: <JobSeekersIcon />
  },
  {
    path: '/career-advice',
    label: 'Career Advice',
    icon: <AdviceIcon />
  },
  {
    path: '/education-training',
    label: 'Education & Training',
    icon: <EducationIcon />
  }
];

  const navigate = useNavigate();
  const normalizedPath = location.pathname.toLowerCase();
  const isAuthPage = normalizedPath === '/login' || normalizedPath === '/admin/login' || normalizedPath.startsWith('/register');

  useEffect(() => {
    try {
      const token = localStorage.getItem('lmis_token');
      if (!token) {
        setUser(null);
        return;
      }
      const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
      const base64 = raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const role_id = payload.role_id ?? payload.user?.role_id ?? null;
      setUser({ full_name: payload.full_name ?? payload.name ?? payload.user?.full_name, role_id });
    } catch (e) {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('lmis_token');
    localStorage.removeItem('lmis_user');
    setUser(null);
    navigate('/login');
  };

  return (

    <header
      className={`navbar ${
        scrolled ? 'navbar--scrolled' : ''
      }`}
    >

      {/* LEFT SECTION */}

      <div className="navbar__left">

        {/* HAMBURGER */}

        <button
          className={`navbar__hamburger ${
            sidebarOpen
              ? 'navbar__hamburger--open'
              : ''
          }`}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >

          <span />
          <span />
          <span />

        </button>

        {/* BRAND */}

        <Link
          to="/"
          className="navbar__brand"
        >

          <img
            src="https://flagcdn.com/w40/sz.png"
            alt="Eswatini Flag"
            style={{
              width: '32px',
              marginRight: '10px',
              borderRadius: '4px'
            }}
          />

          <span className="navbar__brand-acronym">
            ELMIS
          </span>

          <span className="navbar__brand-divider" />

          <span className="navbar__brand-full">
            Labour Market Information System
          </span>

        </Link>

      </div>

      {/* NAVIGATION LINKS */}

      <nav className="navbar__links">

        {navLinks.map(({ path, label, icon }) => {

          const active =
            location.pathname === path;

          return (

            <Link
              key={path}
              to={path}
              className={`navbar__link ${
                active
                  ? 'navbar__link--active'
                  : ''
              }`}
            >

              <span className="navbar__link-icon">
                {icon}
              </span>

              <span className="navbar__link-label">
                {label}
              </span>

              {active && (
                <span className="navbar__link-indicator" />
              )}

            </Link>

          );

        })}

      </nav>

      <div className="navbar__right">
        {!isAuthPage && (
          user ? (
            <>
              <Link to={user.role_id === 2 ? '/employer' : user.role_id === 1 ? '/admin' : '/'} className="navbar__btn navbar__btn--ghost">
                Welcome, {user.full_name}
              </Link>
              <button onClick={handleLogout} style={{ background: user.role_id === 2 ? '#dc2626' : '#0ea5e9', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                Login
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Register
              </Link>
            </>
          )
        )}
      </div>

    </header>

  );

};

export default Navbar;

/* =========================================
   ICONS
========================================= */

function HomeIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />

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

      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>

    </svg>

  );

}

function StatsIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M5 12H3v9h2v-9zm4-5H7v14h2V7zm4-4h-2v18h2V3zm4 8h-2v10h2v-10zm4-4h-2v14h2V7z" />

    </svg>

  );

}

function AdviceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 4.5 5.4 9.4 6.3 10.2a1 1 0 0 0 1.4 0C13.6 18.4 19 13.5 19 9a7 7 0 0 0-7-7zm1 12h-2v-2H9l3-3 3 3h-2v2zm0-8h-2V4h2v2z" />
    </svg>
  );
}

function PublicationsIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/>

    </svg>

  );

}
function VacancyIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10V4H4v16h16V6zM12 3a1 1 0 0 1 1 1c0 .14-.11.56-.18 1h-1.64C11.11 4.56 11 4.14 11 4a1 1 0 0 1 1-1zm-1 13H8v-2h3v2zm0-4H8v-2h3v2zm5 4h-3v-2h3v2zm0-4h-3v-2h3v2z"/>

    </svg>

  );

}

function JobSeekersIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>

    </svg>

  );

}
function EducationIcon() {

  return (

    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >

      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13l-7-3.82V15l7 3.82L19 15v-2.82L12 16z"/>

    </svg>

  );

}