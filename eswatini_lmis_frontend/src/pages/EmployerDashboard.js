import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBriefcase,
  FaClipboardList,
  FaFileAlt,
  FaSignOutAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaSpinner,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import './EmployerDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

const decodeToken = (token) => {
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64 = raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const authHeader = (token) => {
  if (!token) return {};
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  return { Authorization: `Bearer ${raw}` };
};

const pageLinks = [
  { id: 'view-vacancies', path: '/vacancies', label: 'View Vacancies', icon: <FaBriefcase />, description: 'Browse available jobs and manage your postings' },
  { id: 'post-vacancy', path: '/employer/vacancies/new', label: 'Post Vacancy', icon: <FaFileAlt />, description: 'Create a new job vacancy from your employer dashboard' },
  { id: 'applications', path: '/employer/applications', label: 'Applications', icon: <FaClipboardList />, description: 'View applications submitted for your jobs' },
];

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  const [employerJobs, setEmployerJobs] = useState([]);
  const [employerJobsLoading, setEmployerJobsLoading] = useState(false);
  const [employerJobsError, setEmployerJobsError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('lmis_token');
    if (!token) return setAuthStatus('unauthenticated');

    const payload = decodeToken(token);
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('lmis_token');
        return setAuthStatus('unauthenticated');
      }

      const roleId = payload.role_id ?? payload.user?.role_id ?? null;
      setUser({
        id: payload.id ?? payload.user?.id,
        full_name: payload.full_name ?? payload.name ?? payload.user?.full_name ?? 'Employer',
        email: payload.email ?? payload.user?.email,
        role_id: roleId,
      });

      return setAuthStatus(roleId === 2 ? 'ok' : 'forbidden');
    }

    // fallback to /auth/me
    fetch(`${API_BASE}/auth/me`, { headers: authHeader(token) })
      .then((res) => {
        if (!res.ok) throw new Error('unauthenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setAuthStatus(data.role_id === 2 ? 'ok' : 'forbidden');
      })
      .catch(() => setAuthStatus('unauthenticated'));
  }, []);

  useEffect(() => {
    if (authStatus === 'ok') {
      setShowLoginMessage(true);
      loadEmployerJobs();
    }
  }, [authStatus]);

  const loadEmployerJobs = async () => {
    setEmployerJobsLoading(true);
    setEmployerJobsError(null);

    try {
      const token = localStorage.getItem('lmis_token');
      const res = await fetch(`${API_BASE}/employers/jobs`, {
        headers: authHeader(token),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to load employer jobs');
      }
      const data = await res.json();
      setEmployerJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setEmployerJobsError(err.message || 'Unable to fetch employer jobs');
    } finally {
      setEmployerJobsLoading(false);
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);

      try {
        const res = await fetch(`${API_BASE}/jobs`);
        if (!res.ok) {
          throw new Error('Failed to load vacancies');
        }
        const data = await res.json();
        setAllJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setJobsError(err.message || 'Unable to fetch vacancies');
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const applicationTotals = employerJobs.reduce(
    (acc, job) => ({
      total: acc.total + Number(job.applications_count || 0),
      pending: acc.pending + Number(job.pending_count || 0),
      accepted: acc.accepted + Number(job.accepted_count || 0),
      rejected: acc.rejected + Number(job.rejected_count || 0),
    }),
    { total: 0, pending: 0, accepted: 0, rejected: 0 }
  );

  const handleLogout = () => {
    localStorage.removeItem('lmis_token');
    localStorage.removeItem('lmis_user');
    navigate('/login');
  };

  if (authStatus === 'loading') return <div style={{ padding: 40 }}>Verifying access…</div>;

  if (authStatus === 'unauthenticated') {
    return (
      <div style={{ padding: 40 }}>
        <h2>Employer Access</h2>
        <p>Please log in to access your employer dashboard.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  if (authStatus === 'forbidden') {
    return (
      <div style={{ padding: 40 }}>
        <h2>Access Denied</h2>
        <p>You do not have employer access. You are logged in as {user?.full_name} (role {user?.role_id}).</p>
        <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, border: 'none' }}>Logout</button>
      </div>
    );
  }

  // Professional Enterprise-Grade Styles Object
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f9fb 0%, #f0f4f9 50%, #e8ecf2 100%)',
      fontFamily: '"Segoe UI", "Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0',
      margin: '0',
    },
    headerBanner: {
      borderRadius: '0',
      overflow: 'hidden',
      marginBottom: '0',
      margin: '0',
      animation: 'slideDown 0.7s ease-out',
      width: '100%',
    },
    headerContent: {
      position: 'relative',
      minHeight: '280px',
      backgroundImage: 'url(https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=2000&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center right',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
    headerOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(10,25,47,0.8) 0%, rgba(30,58,98,0.65) 50%, rgba(59,130,246,0.4) 100%)',
      backdropFilter: 'blur(2px)',
    },
    headerInner: {
      position: 'relative',
      zIndex: 2,
      padding: '60px 80px',
      color: '#ffffff',
      width: '100%',
      maxWidth: '100%',
    },
    headerTag: {
      textTransform: 'uppercase',
      color: '#a5d8ff',
      fontWeight: 900,
      letterSpacing: '3px',
      marginBottom: '16px',
      fontSize: '11px',
      animation: 'fadeIn 1s ease-out 0.2s both',
      opacity: 0.9,
    },
    headerTitle: {
      margin: 0,
      fontSize: '54px',
      fontWeight: 900,
      lineHeight: 1.15,
      animation: 'fadeIn 1s ease-out 0.3s both',
      letterSpacing: '-1px',
    },
    headerSubtitle: {
      marginTop: '16px',
      fontSize: '17px',
      opacity: 0.92,
      animation: 'fadeIn 1s ease-out 0.4s both',
      fontWeight: 400,
      lineHeight: 1.6,
      maxWidth: '650px',
    },
    topSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '40px 80px',
      gap: '20px',
      flexWrap: 'wrap',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e9f0',
    },
    topLeftText: {
      flex: 1,
    },
    topLeftTitle: {
      margin: 0,
      fontSize: '32px',
      fontWeight: 900,
      color: '#0a1930',
      letterSpacing: '-0.6px',
    },
    topLeftDesc: {
      margin: '8px 0 0',
      color: '#667085',
      fontSize: '15px',
      fontWeight: 500,
    },
    logoutBtn: {
      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 700,
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: '0 8px 24px rgba(220, 53, 69, 0.25)',
      animation: 'slideIn 0.6s ease-out',
      letterSpacing: '0.5px',
      fontFamily: 'inherit',
    },
    successBanner: {
      margin: '32px 80px 0',
      padding: '18px 28px',
      backgroundColor: '#f0fdf4',
      borderRadius: '10px',
      border: '1.5px solid #86efac',
      color: '#15803d',
      fontSize: '14px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      animation: 'slideDown 0.5s ease-out',
      boxShadow: '0 4px 12px rgba(132, 204, 22, 0.1)',
    },
    cardsGrid: {
      padding: '40px 80px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '28px',
      marginBottom: '0',
      backgroundColor: '#fafbfc',
    },
    card: {
      display: 'block',
      padding: '32px',
      borderRadius: '12px',
      background: '#ffffff',
      textDecoration: 'none',
      color: '#0a1930',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
      border: '1.5px solid #e5e9f0',
      transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    cardIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      background: 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)',
      color: '#1e3a8a',
      boxShadow: '0 6px 16px rgba(30, 58, 137, 0.15)',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '18px',
      marginBottom: '20px',
    },
    cardTitle: {
      margin: 0,
      fontSize: '19px',
      fontWeight: 800,
      color: '#0a1930',
      letterSpacing: '-0.3px',
    },
    cardDesc: {
      margin: '10px 0 0',
      color: '#667085',
      fontSize: '14px',
      lineHeight: 1.6,
      fontWeight: 500,
    },
    statsGrid: {
      marginTop: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '14px',
    },
    statBadge: {
      padding: '14px 16px',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: 800,
      textAlign: 'center',
      transition: 'all 0.35s ease',
      boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.04)',
    },
    section: {
      padding: '48px 80px',
      borderRadius: '0',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      border: 'none',
      borderTop: '1px solid #e5e9f0',
      animation: 'slideUp 0.6s ease-out',
      width: '100%',
      margin: '0',
      maxWidth: '100%',
    },
    sectionHeader: {
      marginBottom: '40px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '20px',
    },
    sectionTag: {
      margin: 0,
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '2.5px',
      fontWeight: 900,
      color: '#0369a1',
      opacity: 0.85,
    },
    sectionTitle: {
      margin: '12px 0 0',
      fontSize: '36px',
      fontWeight: 900,
      color: '#0a1930',
      letterSpacing: '-0.7px',
    },
    sectionDesc: {
      margin: '14px 0 0',
      maxWidth: '620px',
      color: '#667085',
      fontSize: '15px',
      lineHeight: 1.7,
      fontWeight: 500,
    },
    jobCard: {
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#ffffff',
      border: '1.5px solid #e5e9f0',
      padding: '28px',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
      transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative',
    },
    jobCardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '20px',
    },
    jobIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0369a1',
      fontSize: '26px',
      flexShrink: 0,
      boxShadow: '0 6px 16px rgba(2, 132, 199, 0.12)',
    },
    jobSector: {
      margin: 0,
      color: '#0369a1',
      fontSize: '11px',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
    },
    jobTitle: {
      margin: '10px 0 0',
      fontSize: '21px',
      fontWeight: 800,
      color: '#0a1930',
      lineHeight: 1.3,
      letterSpacing: '-0.4px',
    },
    jobDesc: {
      margin: 0,
      color: '#475569',
      lineHeight: 1.8,
      minHeight: '80px',
      fontSize: '14px',
      fontWeight: 500,
    },
    jobMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      alignItems: 'center',
      marginTop: '20px',
    },
    jobTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#0369a1',
      background: '#f0f9ff',
      padding: '8px 14px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 700,
      transition: 'all 0.3s ease',
      border: '1px solid #e0f2fe',
      letterSpacing: '0.3px',
    },
    loadingSpinner: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '28px',
      borderRadius: '10px',
      background: '#f0f9ff',
      color: '#0a1930',
      fontSize: '14px',
      fontWeight: 600,
      border: '1px solid #e0f2fe',
    },
    errorBox: {
      padding: '28px',
      borderRadius: '10px',
      background: '#fef2f2',
      color: '#7c2d12',
      fontSize: '14px',
      fontWeight: 600,
      border: '1.5px solid #fecaca',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        /* ============ PREMIUM ANIMATIONS ============ */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(30, 58, 137, 0), 0 8px 24px rgba(30, 58, 137, 0.12); }
          50% { box-shadow: 0 0 30px rgba(30, 58, 137, 0.1), 0 12px 32px rgba(30, 58, 137, 0.18); }
          100% { box-shadow: 0 0 20px rgba(30, 58, 137, 0), 0 8px 24px rgba(30, 58, 137, 0.12); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        /* ============ PROFESSIONAL CARD HOVER EFFECTS ============ */
        .employer-dashboard-card {
          position: relative;
          overflow: hidden;
        }
        .employer-dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.75s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          border-radius: 12px;
        }
        .employer-dashboard-card:hover {
          transform: translateY(-10px) scale(1.015);
          box-shadow: 0 20px 40px rgba(30, 58, 137, 0.18);
          border-color: #60a5fa;
          background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
        }
        .employer-dashboard-card:hover::before {
          left: 100%;
        }
        .employer-dashboard-card:active {
          transform: translateY(-6px) scale(1.008);
        }
        
        /* ============ PROFESSIONAL VACANCY CARD HOVER ============ */
        .dashboard-vacancy-card {
          position: relative;
          overflow: hidden;
        }
        .dashboard-vacancy-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.75s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          border-radius: 12px;
        }
        .dashboard-vacancy-card:hover {
          transform: translateY(-10px) scale(1.012);
          box-shadow: 0 20px 40px rgba(2, 132, 199, 0.18);
          border-color: #06b6d4;
          background: linear-gradient(135deg, #ffffff 0%, #f7feff 100%);
        }
        .dashboard-vacancy-card:hover::before {
          left: 100%;
        }
        .dashboard-vacancy-card:active {
          transform: translateY(-6px) scale(1.006);
        }
        
        /* ============ BUTTON EFFECTS ============ */
        button {
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(220, 53, 69, 0.35) !important;
        }
        button:active:not(:disabled) {
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* ============ PROFESSIONAL LINK STYLES ============ */
        a {
          text-decoration: none;
        }
        a:focus-visible {
          outline: 2px solid #0369a1;
          outline-offset: 2px;
          border-radius: 6px;
        }
        
        /* ============ SMOOTH SCROLLING ============ */
        html {
          scroll-behavior: smooth;
        }
        
        /* ============ TEXT SELECTION ============ */
        ::selection {
          background-color: #0369a1;
          color: white;
        }
        ::-moz-selection {
          background-color: #0369a1;
          color: white;
        }
        
        /* ============ RESPONSIVE ENHANCEMENTS ============ */
        @media (max-width: 1024px) {
          .employer-dashboard-card:hover,
          .dashboard-vacancy-card:hover {
            transform: translateY(-6px) scale(1.01);
          }
        }
        
        @media (max-width: 768px) {
          .employer-dashboard-card:hover,
          .dashboard-vacancy-card:hover {
            transform: translateY(-4px) scale(1.005);
          }
        }
      `}
      </style>

      {/* Header Banner */}
      <div style={styles.headerBanner}>
        <div style={styles.headerContent}>
          <div style={styles.headerOverlay} />
          <div style={styles.headerInner}>
            <p style={styles.headerTag}>🏢 Welcome to Your Workspace</p>
            <h1 style={styles.headerTitle}>Welcome, {user?.full_name || 'Employer'}</h1>
            <p style={styles.headerSubtitle}>
              You are logged in as <strong>Employer</strong> — manage your jobs, track applications, monitor performance metrics, and grow your business.
            </p>
          </div>
        </div>
      </div>

      {/* Top Section */}
      <div style={styles.topSection}>
        <div style={styles.topLeftText}>
          <h2 style={styles.topLeftTitle}>Employer Hub</h2>
          <p style={styles.topLeftDesc}>Quick access to manage your company and job listings</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Success Message */}
      {showLoginMessage && user && (
        <div style={{...styles.successBanner, marginLeft: '80px', marginRight: '80px', width: 'calc(100% - 160px)'}}>
          <FaCheckCircle style={{ fontSize: '18px' }} />
          Welcome back, <strong>{user.full_name}</strong>! You have successfully logged in to your employer dashboard.
        </div>
      )}

      {/* Action Cards Grid */}
      <div style={styles.cardsGrid}>
        {pageLinks.map(({ id, path, label, icon, description }) => {
          const isApplicationsCard = id === 'applications';

          return (
            <Link
              key={id}
              to={path}
              style={styles.card}
              className="employer-dashboard-card professional-card-base"
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{label}</h3>
                  <p style={styles.cardDesc}>{description}</p>
                </div>
              </div>

              {/* Application Stats */}
              {isApplicationsCard && (
                <div style={styles.statsGrid}>
                  {employerJobsLoading ? (
                    <p style={{ margin: 0, color: '#0a1930', fontWeight: 600, gridColumn: '1/-1' }}>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                      Loading stats…
                    </p>
                  ) : employerJobsError ? (
                    <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, gridColumn: '1/-1' }}>
                      {employerJobsError}
                    </p>
                  ) : (
                    <>
                      <div style={{ ...styles.statBadge, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#0a1930', fontWeight: 700 }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e40af' }}>{applicationTotals.total}</div>
                        <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>Applications</div>
                      </div>
                      <div style={{ ...styles.statBadge, background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)', color: '#0a1930', fontWeight: 700 }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#14532d' }}>{applicationTotals.pending}</div>
                        <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>Pending</div>
                      </div>
                      <div style={{ ...styles.statBadge, background: 'linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%)', color: '#0a1930', fontWeight: 700 }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1d4ed8' }}>{applicationTotals.accepted}</div>
                        <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>Accepted</div>
                      </div>
                      <div style={{ ...styles.statBadge, background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', color: '#0a1930', fontWeight: 700 }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#b91c1c' }}>{applicationTotals.rejected}</div>
                        <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>Rejected</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Vacancies Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionTag}>Browse All Postings</p>
            <h2 style={styles.sectionTitle}>Active Job Vacancies</h2>
            <p style={styles.sectionDesc}>
              Explore all job listings across the platform. Stay informed about opportunities in your sector.
            </p>
          </div>
        </div>

        {jobsLoading ? (
          <div style={styles.loadingSpinner}>
            <FaSpinner style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }} />
            Loading vacancies…
          </div>
        ) : jobsError ? (
          <div style={styles.errorBox}>
            <FaTimes style={{ marginRight: '8px' }} />
            {jobsError}
          </div>
        ) : allJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <FaBriefcase style={{ fontSize: '48px', opacity: 0.4, marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No vacancies available at the moment</p>
            <p style={{ fontSize: '14px', margin: '8px 0 0' }}>Check back later for new opportunities</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '28px'
          }}>
            {allJobs.map((job) => (
              <div
                key={job.id}
                style={styles.jobCard}
                className="dashboard-vacancy-card professional-card-base"
              >
                <div style={styles.jobCardHeader}>
                  <div style={{ flex: 1 }}>
                    <p style={styles.jobSector}>{job.sector || 'GENERAL'}</p>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                  </div>
                  <div style={styles.jobIcon}>
                    <FaBuilding />
                  </div>
                </div>

                <p style={styles.jobDesc}>
                  {job.description?.slice(0, 160) || 'No job description available.'}
                  {job.description?.length > 160 ? '…' : ''}
                </p>

                <div style={styles.jobMeta}>
                  <span style={styles.jobTag}>
                    <FaMapMarkerAlt style={{ fontSize: '12px' }} />
                    {job.location || 'Location not set'}
                  </span>
                  <span style={styles.jobTag}>
                    <FaClock style={{ fontSize: '12px' }} />
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployerDashboard;