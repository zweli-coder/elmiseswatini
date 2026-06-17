import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaTimes, FaUserAlt, FaBriefcase, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaBan, FaChevronLeft } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const base64 = raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Always send token as "Bearer <token>", stripping any existing "Bearer " prefix
const authHeader = (token) => {
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  return { Authorization: `Bearer ${raw}` };
};

const AdminJobSeekerReview = () => {
  const token = useMemo(() => localStorage.getItem('lmis_token'), []);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [jobSeekers, setJobSeekers] = useState([]);
  const [loadingJobSeekers, setLoadingJobSeekers] = useState(false);
  const [jobSeekersError, setJobSeekersError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

  const adminRedirect = '/admin';

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
          role_id: roleId
        });
        setAuthStatus(roleId === 1 ? 'ok' : 'forbidden');
        return;
      }
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: authHeader(token)
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('lmis_token');
          throw new Error('unauthenticated');
        }
        if (!res.ok) throw new Error('server_error');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setAuthStatus(data.role_id === 1 ? 'ok' : 'forbidden');
      })
      .catch(err => {
        if (err.message === 'unauthenticated') {
          setAuthStatus('unauthenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      });
  }, [token]);

  useEffect(() => {
    if (authStatus === 'ok') {
      loadJobSeekers();
    }
  }, [authStatus, token]); // Added token to dependency array

  const loadJobSeekers = async () => {
    setLoadingJobSeekers(true);
    setJobSeekersError(null);
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: authHeader(token)
      });
      if (!res.ok) throw new Error('Failed to load job seekers');
      const data = await res.json();
      setJobSeekers(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobSeekersError(err.message || 'Could not fetch job seekers');
    } finally {
      setLoadingJobSeekers(false);
    }
  };

  const hasRequiredJobSeekerDocs = (seeker) => {
    return Boolean(
      seeker.national_id &&
      seeker.education_level &&
      seeker.skills &&
      seeker.region &&
      seeker.description
    );
  };

  const handleJobSeekerDecision = async (id, decision) => {
    setActionStatus({ type: 'loading', message: 'Processing decision...' });
    try {
      const res = await fetch(`${API_BASE}/admin/jobseekers/${id}/status`, {
        method: 'PUT',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${decision} job seeker`);
      }
      setActionStatus({ type: 'success', message: `Job seeker ${decision} successfully!` });
      setJobSeekers((prev) =>
        prev.map((seeker) =>
          seeker.id === id ? { ...seeker, admin_decision: decision } : seeker
        )
      );
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message });
    } finally {
      setTimeout(() => setActionStatus({ type: '', message: '' }), 2000);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div style={styles.centered}>
        <FaSpinner style={{ fontSize: '32px', color: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#475569', marginTop: '12px' }}>Verifying access…</p>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    navigate('/login?redirect=/admin/jobseekers-review');
    return null;
  }

  if (authStatus === 'forbidden') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <p style={styles.sectionTag}>Access Denied</p>
          <h1 style={styles.title}>You don't have admin access</h1>
          <p style={styles.description}>
            This page is only accessible to system administrators.
          </p>
        </div>
      </div>
    );
  }

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
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes cardPop {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroText}>
          <p style={styles.sectionTag}>Admin Review</p>
          <h1 style={{ ...styles.title, color: '#ffffff' }}>Job Seeker Submissions</h1>
          <p style={{ ...styles.description, color: 'rgba(255,255,255,0.92)', maxWidth: '720px' }}>
            Review and manage job seeker profiles. Only reject a profile when required documents are missing.
          </p>
        </div>
      </div>

      <div style={styles.panelHeader}>
        <div>
          <p style={styles.sectionTag}>Job Seeker Review</p>
          <h2 style={styles.panelTitle}>Review job seeker submissions</h2>
          <p style={styles.panelDescription}>
            Only reject a profile when required documents are missing. Accept completed profiles directly from the admin dashboard.
          </p>
        </div>
        <button
          type="button"
          style={styles.panelClose}
          onClick={() => navigate('/admin')}
        >
          <FaChevronLeft style={{ marginRight: '8px' }} /> Back to Dashboard
        </button>
      </div>

      {actionStatus.message && (
        <div style={{
          ...styles.alert,
          ...(actionStatus.type === 'success' ? styles.alertSuccess : styles.alertError),
          marginBottom: '20px'
        }}>
          {actionStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {actionStatus.message}
        </div>
      )}

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
                    <p style={styles.jobSeekerMeta}>{seeker.sector || 'Unknown sector'} · {seeker.region || 'Unknown region'}</p>
                  </div>
                  <span style={{ ...styles.jobSeekerStatus, backgroundColor: hasDocs ? '#d1fae5' : '#fee2e2', color: hasDocs ? '#166534' : '#b91c1c' }}>
                    {hasDocs ? 'Documents complete' : 'Missing docs'}
                  </span>
                </div>

                <p style={styles.jobSeekerText}>{seeker.description || 'No description provided.'}</p>
                <div style={styles.jobSeekerTags}>
                  <span style={styles.jobSeekerTag}>{seeker.education_level || 'No education'}</span>
                  <span style={styles.jobSeekerTag}>{seeker.experience_years ? `${seeker.experience_years} yrs` : 'No experience data'}</span>
                </div>

                <div style={styles.jobSeekerActions}>
                  <button
                    type="button"
                    style={{ ...styles.jobSeekerButton, ...(seeker.admin_decision === 'accepted' ? styles.jobSeekerAccepted : (hasDocs ? styles.jobSeekerAccept : styles.jobSeekerDisabled)) }}
                    onClick={() => {
                      if (!hasDocs) {
                        alert('This profile cannot be accepted because required documents are missing.');
                        return;
                      }
                      handleJobSeekerDecision(seeker.id, 'accepted');
                    }}
                    disabled={!hasDocs || seeker.admin_decision === 'accepted'}
                  >
                    {seeker.admin_decision === 'accepted' ? <FaCheckCircle style={{ marginRight: '5px' }} /> : null}
                    Accept
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.jobSeekerButton, ...(seeker.admin_decision === 'rejected' ? styles.jobSeekerRejected : (hasDocs ? styles.jobSeekerDisabled : styles.jobSeekerReject)) }}
                    onClick={() => {
                      if (hasDocs) {
                        alert('Reject only when required documents are missing.');
                        return;
                      }
                      handleJobSeekerDecision(seeker.id, 'rejected');
                    }}
                    disabled={seeker.admin_decision === 'rejected'}
                  >
                    {seeker.admin_decision === 'rejected' ? <FaBan style={{ marginRight: '5px' }} /> : null}
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
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f7fb',
    padding: '40px 30px',
    fontFamily: 'Inter, Arial, sans-serif'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, Arial, sans-serif'
  },
  heroBanner: {
    position: 'relative',
    borderRadius: '28px',
    minHeight: '240px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.20), rgba(15,23,42,0.70))'
  },
  heroText: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '40px 24px',
    color: '#ffffff'
  },
  header: {
    maxWidth: '700px'
  },
  sectionTag: {
    color: '#0ea5e9',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    fontSize: '12px'
  },
  title: {
    fontSize: '38px',
    margin: 0,
    color: '#103063',
    lineHeight: 1.08
  },
  description: {
    color: '#475569',
    fontSize: '16px',
    marginTop: '14px',
    maxWidth: '740px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '24px',
    padding: '28px',
    borderRadius: '28px',
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.16)'
  },
  panelTitle: {
    fontSize: '28px',
    margin: '8px 0 0',
    color: '#0f172a'
  },
  panelDescription: {
    color: '#475569',
    fontSize: '15px',
    marginTop: '10px',
    maxWidth: '720px'
  },
  panelClose: {
    display: 'inline-flex',
    alignItems: 'center',
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: '#ffffff',
    borderRadius: '14px',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  panelNotice: {
    color: '#64748b',
    fontSize: '15px',
    margin: 0,
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15, 23, 42, 0.06)'
  },
  jobSeekerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px'
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
    cursor: 'pointer',
    transition: 'transform 0.24s ease, box-shadow 0.24s ease'
  },
  jobSeekerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px'
  },
  jobSeekerName: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
    color: '#0f172a'
  },
  jobSeekerMeta: {
    margin: '6px 0 0',
    color: '#475569',
    fontSize: '14px'
  },
  jobSeekerStatus: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '12px'
  },
  jobSeekerText: {
    color: '#334155',
    fontSize: '14px',
lineHeight: 1.7,
    margin: 0
  },
  jobSeekerTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  jobSeekerTag: {
    backgroundColor: '#e0f2fe',
    color: '#0c4a6e',
    borderRadius: '999px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 600
  },
  jobSeekerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  jobSeekerButton: {
    flex: '1 1 auto',
    padding: '12px 16px',
    borderRadius: '999px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  jobSeekerAccept: {
    backgroundColor: '#0f766e',
    color: '#ffffff'
  },
  jobSeekerAccepted: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    cursor: 'not-allowed',
    opacity: 0.8
  },
  jobSeekerReject: {
    backgroundColor: '#dc2626',
    color: '#ffffff'
  },
  jobSeekerRejected: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    cursor: 'not-allowed',
    opacity: 0.8
  },
  jobSeekerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  jobSeekerDecision: {
    margin: 0,
    color: '#0f172a',
    fontSize: '14px'
  },
  alert: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px'
  },
  alertSuccess: {
    backgroundColor: '#d1fae5',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca'
  },
};

export default AdminJobSeekerReview;