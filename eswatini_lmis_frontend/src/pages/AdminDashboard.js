import React, { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  FaHome,
  FaIndustry,
  FaChartBar,
  FaBriefcase,
  FaUsers,
  FaBook,
  FaLightbulb,
  FaGraduationCap,
  FaFileAlt,
  FaTools,
  FaUserPlus,
  FaUserCog,
  FaSpinner,
  FaSignOutAlt,
  FaDatabase,
  FaClipboardList
} from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const pageLinks = [
  { id: 'jobseekers', path: '/admin/jobseekers-review', label: 'Job Seekers', icon: <FaUsers />, description: 'Review submitted talent' },
  { id: 'create-users', path: '/register?redirect=/admin', label: 'Create Users', icon: <FaUserPlus />, description: 'Create admin, employer, or user accounts' },
  { id: 'manage-users', path: '/admin/users', label: 'Manage Users', icon: <FaUserCog />, description: 'View, edit and delete system users' },
  { id: 'admin-publications', path: '/admin/publications', label: 'Admin Publications', icon: <FaFileAlt />, description: 'Upload and manage publications' },
  { id: 'training-admin', path: '/admin/education-training', label: 'Training Admin', icon: <FaTools />, description: 'Manage training resources' },
  { id: 'statistics-admin', path: '/admin/statistics', label: 'Statistics Admin', icon: <FaDatabase />, description: 'Upload statistical datasets' },
];

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64 = raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// Always send token as "Bearer <token>", stripping any existing prefix
const authHeader = (token) => {
  if (!token) return {};
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  return { Authorization: `Bearer ${raw}` };
};

const AdminDashboard = () => {
  const token = useMemo(() => localStorage.getItem('lmis_token'), []);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [statsError, setStatsError] = useState(null);

  // Job seeker review states
  const [activePanel, setActivePanel] = useState(null);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [loadingJobSeekers, setLoadingJobSeekers] = useState(false);
  const [jobSeekersError, setJobSeekersError] = useState(null);

  const adminRedirect = '/admin';

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setAuthStatus('unauthenticated');
      return;
    }

    const payload = decodeToken(token);

    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('lmis_token');
        setAuthStatus('unauthenticated');
        return;
      }

      const roleId =
        payload.role_id ??
        payload.user?.role_id ??
        (payload.role === 'admin' ? 1 : null) ??
        (typeof payload.role === 'number' ? payload.role : null);

      if (roleId !== null) {
        setUser({
          id: payload.id ?? payload.user?.id,
          full_name: payload.full_name ?? payload.name ?? payload.user?.full_name ?? 'Admin',
          email: payload.email ?? payload.user?.email,
          role_id: roleId,
        });
        setAuthStatus(roleId === 1 ? 'ok' : 'forbidden');
        return;
      }
    }

    // Fallback: verify via /api/auth/me
    fetch(`${API_BASE}/auth/me`, { headers: authHeader(token) })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('lmis_token');
          throw new Error('unauthenticated');
        }
        if (!res.ok) throw new Error('server_error');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setAuthStatus(data.role_id === 1 ? 'ok' : 'forbidden');
      })
      .catch((err) => {
        setAuthStatus(err.message === 'unauthenticated' ? 'unauthenticated' : 'unauthenticated');
      });
  }, [token]);

  // ── Fetch stats once confirmed admin ──────────────────────────────────────
  useEffect(() => {
    if (authStatus !== 'ok' || !token) return;

    fetch(`${API_BASE}/admin/stats`, { headers: authHeader(token) })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setStatsError(err.message));
  }, [authStatus, token]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('lmis_token');
    navigate('/login');
  };

  const hasRequiredJobSeekerDocs = (seeker) =>
    Boolean(
      seeker.national_id &&
      seeker.education_level &&
      seeker.skills &&
      seeker.region &&
      seeker.description
    );

  const loadJobSeekers = async () => {
    setActivePanel('jobseekers');
    setLoadingJobSeekers(true);
    setJobSeekersError(null);

    try {
      const res = await API.get('/employees');
      setJobSeekers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setJobSeekersError(
        err?.response?.data?.error || err.message || 'Unable to load job seekers'
      );
    } finally {
      setLoadingJobSeekers(false);
    }
  };


  // FIX: single, correctly scoped definition (was duplicated / misplaced before)
  const handleJobSeekerDecision = (id, decision) => {
    setJobSeekers((prev) =>
      prev.map((seeker) =>
        seeker.id === id ? { ...seeker, admin_decision: decision } : seeker
      )
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authStatus === 'loading') {
    return (
      <div style={styles.centered}>
        <FaSpinner style={{ fontSize: '32px', color: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#475569', marginTop: '12px' }}>Verifying access…</p>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (authStatus === 'unauthenticated') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <p style={styles.sectionTag}>Admin Access Required</p>
          <h1 style={styles.title}>Please log in first</h1>
          <p style={styles.description}>Admin credentials are required to access this page.</p>
        </div>
        <div style={styles.authActions}>
          <Link to={`/login?redirect=${encodeURIComponent(adminRedirect)}`} style={styles.actionButton}>
            Login
          </Link>
          <Link
            to={`/register?redirect=${encodeURIComponent(adminRedirect)}`}
            style={{ ...styles.actionButton, ...styles.actionButtonSecondary }}
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // ── Wrong role ────────────────────────────────────────────────────────────
  if (authStatus === 'forbidden') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <p style={styles.sectionTag}>Access Denied</p>
          <h1 style={styles.title}>You don't have admin access</h1>
          <p style={styles.description}>
            This page is only accessible to system administrators.
            {user && (
              <>
                {' '}You are logged in as <strong>{user.full_name}</strong> (role {user.role_id}).
              </>
            )}
          </p>
        </div>
        <div style={styles.authActions}>
          <Link to="/" style={styles.actionButton}>Go Home</Link>
          <button
            onClick={handleLogout}
            style={{ ...styles.actionButton, ...styles.actionButtonSecondary, border: 'none', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ── Confirmed admin ───────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{`
        .admin-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
        }
        .admin-stat-card,
        .admin-card {
          transition: transform 0.24s ease, box-shadow 0.24s ease;
          will-change: transform, box-shadow;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.10);
        }
        @keyframes floatIcon {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes cardPop {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Hero */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroText}>
          <p style={styles.sectionTag}>Administrator Dashboard</p>
          <h1 style={{ ...styles.title, color: '#ffffff' }}>Your admin command center</h1>
          <p style={{ ...styles.description, color: 'rgba(255,255,255,0.92)', maxWidth: '720px' }}>
            Manage users, vacancies, publications and training resources from one elegant, data-rich workspace.
          </p>
        </div>
      </div>

      {/* Header row */}
      <div style={styles.headerRow}>
        <div style={styles.header}>
          <p style={styles.sectionTag}>Admin Hub</p>
          <h1 style={styles.title}>Admin Navigation Center</h1>
          <p style={styles.description}>
            Welcome back, <strong>{user?.full_name}</strong>. Quick access to every section of the Labour Market
            Information System.
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {statsError ? (
          <p style={{ color: '#ef4444', gridColumn: '1/-1', margin: 0 }}>Could not load stats: {statsError}</p>
        ) : !stats ? (
          <p style={{ color: '#94a3b8', gridColumn: '1/-1', margin: 0 }}>Loading statistics…</p>
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={stats.total_users}
              sub={`${stats.admins ?? '?'} admin · ${stats.employers ?? '?'} employers · ${stats.jobseekers ?? '?'} jobseekers`}
              color="#0ea5e9"
            />
            <StatCard
              label="Total Jobs"
              value={stats.total_jobs}
              sub={`${stats.open_jobs ?? '?'} open`}
              color="#10b981"
            />
            <StatCard
              label="Applications"
              value={stats.total_applications}
              sub={`${stats.pending_applications ?? '?'} pending`}
              color="#f59e0b"
            />
          </>
        )}
      </div>

      {/* Page links grid */}
      <div style={styles.grid}>
        {pageLinks.map(({ id, path, label, icon, description }, index) => {
          if (id === 'jobseekers') {
            return (
              <button
                key={id}
                onClick={loadJobSeekers}
                style={{ ...styles.card, border: 'none', textAlign: 'left' }}
                className="admin-card"
              >
                <div style={styles.cardHeader}>
                  <div style={styles.icon}>{icon}</div>
                  <span style={styles.cardBadge}>Admin</span>
                </div>
                <h2 style={styles.cardTitle}>{label}</h2>
                <div style={styles.tagRow}>
                  <span style={styles.tagPill}>Review</span>
                  <span style={styles.tagPillSecondary}>Job Seekers</span>
                </div>
                <p style={styles.cardDescription}>{description}</p>
              </button>
            );
          }


          return (
            <Link
              key={id}
              to={path}
              style={{ ...styles.card, animationDelay: `${index * 70}ms` }}
              className="admin-card"
            >
              <div style={styles.cardHeader}>
                <div style={styles.icon}>{icon}</div>
                <span style={styles.cardBadge}>Admin</span>
              </div>
              <h2 style={styles.cardTitle}>{label}</h2>
              <div style={styles.tagRow}>
                <span style={styles.tagPill}>Quick Access</span>
                <span style={styles.tagPillSecondary}>System Link</span>
              </div>
              <p style={styles.cardDescription}>{description}</p>
            </Link>
          );
        })}
      </div>

      {/* Job seeker review panel */}
      {activePanel === 'jobseekers' && (
        <section style={styles.jobSeekerPanel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionTag}>Job Seeker Review</p>
              <h2 style={styles.panelTitle}>Review job seeker submissions</h2>
              <p style={styles.panelDescription}>
                Only reject a profile when required documents are missing. Accept completed profiles directly from
                the admin dashboard.
              </p>
            </div>
            <button type="button" style={styles.panelClose} onClick={() => setActivePanel(null)}>
              Close
            </button>
          </div>

          {loadingJobSeekers ? (
            <p style={styles.panelNotice}>Loading job seekers…</p>
          ) : jobSeekersError ? (
            <p style={{ ...styles.panelNotice, color: '#dc2626' }}>{jobSeekersError}</p>
          ) : jobSeekers.length === 0 ? (
            <p style={styles.panelNotice}>No job seeker submissions are currently available.</p>
          ) : (
            <div style={styles.jobSeekerGrid}>
              {jobSeekers.map((seeker) => {
                const hasDocs = hasRequiredJobSeekerDocs(seeker);
                return (
                  <div key={seeker.id} style={styles.jobSeekerCard} className="admin-card">
                    <div style={styles.jobSeekerHeader}>
                      <div>
                        <p style={styles.jobSeekerName}>{seeker.fullname || 'Unnamed applicant'}</p>
                        <p style={styles.jobSeekerMeta}>
                          {seeker.sector || 'Unknown sector'} · {seeker.region || 'Unknown region'}
                        </p>
                      </div>
                      <span
                        style={{
                          ...styles.jobSeekerStatus,
                          backgroundColor: hasDocs ? '#d1fae5' : '#fee2e2',
                          color: hasDocs ? '#166534' : '#b91c1c',
                        }}
                      >
                        {hasDocs ? 'Documents complete' : 'Missing docs'}
                      </span>
                    </div>

                    <p style={styles.jobSeekerText}>{seeker.description || 'No description provided.'}</p>

                    <div style={styles.jobSeekerTags}>
                      <span style={styles.jobSeekerTag}>{seeker.education_level || 'No education'}</span>
                      <span style={styles.jobSeekerTag}>
                        {seeker.experience_years ? `${seeker.experience_years} yrs` : 'No experience data'}
                      </span>
                    </div>

                    <div style={styles.jobSeekerActions}>
                      <button
                        type="button"
                        style={{
                          ...styles.jobSeekerButton,
                          ...(hasDocs ? styles.jobSeekerAccept : styles.jobSeekerDisabled),
                        }}
                        onClick={() => {
                          if (!hasDocs) {
                            alert('This profile cannot be accepted because required documents are missing.');
                            return;
                          }
                          handleJobSeekerDecision(seeker.id, 'accepted');
                        }}
                        disabled={!hasDocs}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        style={{
                          ...styles.jobSeekerButton,
                          ...styles.jobSeekerReject,
                          ...(hasDocs ? styles.jobSeekerDisabled : {}),
                        }}
                        onClick={() => {
                          if (hasDocs) {
                            alert('Reject only when required documents are missing.');
                            return;
                          }
                          handleJobSeekerDecision(seeker.id, 'rejected');
                        }}
                        disabled={hasDocs}
                      >
                        Reject
                      </button>
                    </div>

                    {seeker.admin_decision && (
                      <p style={styles.jobSeekerDecision}>
                        Decision: <strong>{seeker.admin_decision}</strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
};

// ── Sub-component ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }} className="admin-stat-card">
    <p style={{ ...styles.statValue, color }}>{value}</p>
    <p style={styles.statLabel}>{label}</p>
    {sub && <p style={styles.statSub}>{sub}</p>}
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f7fb',
    padding: '40px 30px',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: '1200px',
    margin: '0 auto 32px',   // FIX: was missing auto horizontal margin
    flexWrap: 'wrap',
    gap: '16px',
  },
  header: { maxWidth: '700px' },
  sectionTag: {
    color: '#0ea5e9',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    fontSize: '12px',
  },
  title: { fontSize: '38px', margin: 0, color: '#103063', lineHeight: 1.08 },
  description: { color: '#475569', fontSize: '16px', marginTop: '14px', maxWidth: '740px' },
  heroBanner: {
    position: 'relative',
    borderRadius: '28px',
    minHeight: '300px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1400&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.16), rgba(15,23,42,0.82))',
  },
  heroText: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px' },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    alignSelf: 'flex-start',
    marginTop: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '22px 26px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15, 23, 42, 0.06)',
    minHeight: '145px',
  },
  statValue: { fontSize: '36px', fontWeight: 800, margin: 0, lineHeight: 1 },
  statLabel: { margin: '6px 0 2px', fontWeight: 600, color: '#0f172a', fontSize: '15px' },
  statSub: { margin: 0, color: '#94a3b8', fontSize: '12px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '24px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.10)',
    textDecoration: 'none',
    color: '#0f172a',
    border: '1px solid rgba(59, 130, 246, 0.14)',
    overflow: 'hidden',
    animation: 'cardPop 0.55s ease both',
    cursor: 'pointer',
  },
  // FIX: cardHeader and cardBadge were used in JSX but never defined
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBadge: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #bfdbfe',
  },
  icon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1d4ed8',
    fontSize: '22px',
    animation: 'floatIcon 6s ease-in-out infinite',
  },
  cardTitle: { fontSize: '22px', margin: 0, fontWeight: 800, letterSpacing: '0.1px', color: '#0f172a' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tagPill: {
    borderRadius: '999px',
    padding: '6px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '13px',
    fontWeight: 700,
    border: '1px solid #bbf7d0',
  },
  tagPillSecondary: {
    borderRadius: '999px',
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
    fontSize: '13px',
    fontWeight: 700,
    border: '1px solid #bfdbfe',
  },
  cardDescription: { margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '14px' },
  jobSeekerPanel: {
    marginTop: '36px',
    padding: '28px',
    borderRadius: '28px',
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '24px',
  },
  panelTitle: { fontSize: '28px', margin: '8px 0 0', color: '#0f172a' },
  panelDescription: { color: '#475569', fontSize: '15px', marginTop: '10px', maxWidth: '720px' },
  panelClose: {
    border: 'none',
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    borderRadius: '14px',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  panelNotice: { color: '#64748b', fontSize: '15px', margin: 0 },
  jobSeekerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  jobSeekerCard: {
    background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
    borderRadius: '22px',
    padding: '20px',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  jobSeekerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' },
  jobSeekerName: { fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' },
  jobSeekerMeta: { margin: '6px 0 0', color: '#475569', fontSize: '14px' },
  jobSeekerStatus: { padding: '8px 12px', borderRadius: '999px', fontWeight: 700, fontSize: '12px' },
  jobSeekerText: { color: '#334155', fontSize: '14px', lineHeight: 1.7, margin: 0 },
  jobSeekerTags: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  jobSeekerTag: {
    backgroundColor: '#e0f2fe',
    color: '#0c4a6e',
    borderRadius: '999px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 600,
  },
  jobSeekerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  jobSeekerButton: {
    flex: '1 1 auto',
    padding: '12px 16px',
    borderRadius: '999px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  jobSeekerAccept: { backgroundColor: '#0f766e', color: '#ffffff' },
  jobSeekerReject: { backgroundColor: '#dc2626', color: '#ffffff' },
  jobSeekerDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  jobSeekerDecision: { margin: 0, color: '#0f172a', fontSize: '14px' },
  applicationPanel: {
    marginTop: '36px',
    padding: '28px',
    borderRadius: '28px',
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  applicationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  applicationCard: {
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '22px',
    padding: '22px',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  applicationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' },
  applicationName: { fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' },
  applicationMeta: { margin: '6px 0 0', color: '#475569', fontSize: '14px' },
  applicationStatus: { padding: '8px 12px', borderRadius: '999px', fontWeight: 700, fontSize: '12px' },
  applicationJobInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  applicationText: { color: '#334155', fontSize: '14px', lineHeight: 1.75, margin: 0 },
  applicationActions: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  applicationButton: {
    flex: '0 1 auto',
    minWidth: '120px',
    maxWidth: '160px',
    width: 'auto',
    padding: '12px 16px',
    borderRadius: '999px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  applicationAcceptButton: { backgroundColor: '#10b981', color: '#ffffff' },
  applicationRejectButton: { backgroundColor: '#ef4444', color: '#ffffff' },
  applicationButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  applicationLinks: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  applicationLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '13px',
    backgroundColor: '#eff6ff',
    borderRadius: '999px',
    padding: '8px 12px',
    border: '1px solid rgba(59, 130, 246, 0.16)',
  },
  authActions: { display: 'flex', gap: '16px', marginTop: '30px' },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 26px',
    borderRadius: '12px',
    textDecoration: 'none',
    backgroundColor: '#0ea5e9',
    color: '#fff',
    fontWeight: 700,
    minWidth: '150px',
  },
  actionButtonSecondary: { backgroundColor: '#f1f5f9', color: '#0f172a' },
};

export default AdminDashboard;