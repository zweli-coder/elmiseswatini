import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBriefcase,
  FaUsers,
  FaSpinner,
  FaTimes,
  FaChevronRight,
  FaExclamationCircle
} from 'react-icons/fa';
import { API_ENDPOINT } from '../services/api';


const authHeader = (token) => {
  if (!token) return {};
  return { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` };
};

const EmployerApplications = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedJobId = new URLSearchParams(location.search).get('jobId');

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState(null);
  const [appError, setAppError] = useState(null);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  const applicationSummary = applications.reduce(
    (summary, application) => {
      const status = (application.status || 'pending').toLowerCase();
      summary.total += 1;
      if (status === 'accepted') summary.accepted += 1;
      else if (status === 'rejected') summary.rejected += 1;
      else summary.pending += 1;
      return summary;
    },
    { total: 0, pending: 0, accepted: 0, rejected: 0 }
  );

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setError(null);
      try {
        const token = localStorage.getItem('lmis_token');
        const res = await fetch(`${API_ENDPOINT}/employers/jobs`, {
          headers: authHeader(token)
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || 'Failed to load your jobs');
        }
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load employer jobs');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (!loadingJobs && !error && requestedJobId && jobs.length > 0) {
      const job = jobs.find((item) => String(item.id) === String(requestedJobId));
      if (job) {
        loadApplications(job);
      }
    }
  }, [jobs, loadingJobs, error, requestedJobId]);

  const loadApplications = async (job) => {
    setSelectedJob(job);
    setLoadingApps(true);
    setAppError(null);
    setActionMessage(null);
    setApplications([]);

    try {
      const token = localStorage.getItem('lmis_token');
      const res = await fetch(`${API_ENDPOINT}/employers/jobs/${job.id}/applications`, {
        headers: authHeader(token)
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to load applications');
      }
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setAppError(err.message || 'Unable to load applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setAppError(null);
    setActionMessage(null);
    setStatusUpdatingIds((prev) => [...prev, applicationId]);

    try {
      const token = localStorage.getItem('lmis_token');
      const res = await fetch(`${API_ENDPOINT}/employers/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token)
        },
        body: JSON.stringify({ status: newStatus })
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Unable to update application status');
      }

      setApplications((prev) => prev.map((app) => app.id === applicationId ? { ...app, status: newStatus } : app));
      setActionMessage({ type: 'success', text: `Application ${newStatus} successfully.` });
    } catch (err) {
      setAppError(err.message || 'Status update failed');
    } finally {
      setStatusUpdatingIds((prev) => prev.filter((id) => id !== applicationId));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.sectionTag}>Employer Applications</p>
          <h1 style={styles.title}>Your Job Applications</h1>
          <p style={styles.description}>
            View applications submitted for your vacancies. Select a job to see candidate details and application status.
          </p>
        </div>
       
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button type="button" style={styles.backButton} onClick={() => navigate('/employer')}>
          ← Back to dashboard
        </button>
      </div>

      {loadingJobs ? (
        <div style={styles.loadingPanel}>
          <FaSpinner style={styles.spinner} />
          <p>Loading your job postings…</p>
        </div>
      ) : error ? (
        <div style={styles.errorPanel}>
          <FaExclamationCircle style={{ marginRight: 10 }} />
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div style={styles.emptyPanel}>
          <FaBriefcase style={styles.emptyIcon} />
          <h2>No vacancies found</h2>
          <p>You have not posted any vacancies yet. Start by creating a new job listing.</p>
          <Link to="/employer/vacancies/new" style={styles.secondaryBtn}>Post your first vacancy</Link>
        </div>
      ) : (
        <div style={styles.jobGrid}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.jobTitle}>{job.title}</p>
                  <p style={styles.jobMeta}>{job.location || 'Location not specified'}</p>
                </div>
                <button style={styles.viewButton} onClick={() => loadApplications(job)}>
                  View applications
                  <FaChevronRight />
                </button>
              </div>

              <div style={styles.jobStats}>
                <span style={styles.badge}>Applications {job.applications_count ?? 0}</span>
                <span style={styles.badge}>Pending {job.pending_count ?? 0}</span>
                <span style={styles.badge}>Accepted {job.accepted_count ?? 0}</span>
                <span style={styles.badge}>Rejected {job.rejected_count ?? 0}</span>
              </div>

              <p style={styles.jobDescription}>{job.description?.slice(0, 180) || 'No description available.'}</p>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <section style={styles.appPanel}>
          <div style={styles.appHeader}>
            <div>
              <p style={styles.sectionTag}>Applications for</p>
              <h2 style={styles.subTitle}>{selectedJob.title}</h2>
              <p style={styles.subText}>{selectedJob.location || 'Location not specified'}</p>
              {selectedJob.sector && <p style={styles.subText}>Sector: {selectedJob.sector}</p>}
              {selectedJob.job_type && <p style={styles.subText}>Job type: {selectedJob.job_type}</p>}
              {selectedJob.description && <p style={styles.jobDescription}>{selectedJob.description}</p>}
              {selectedJob.created_at && <p style={styles.jobInfo}>Posted: {new Date(selectedJob.created_at).toLocaleDateString()}</p>}
            </div>
            <button style={styles.closeButton} onClick={() => setSelectedJob(null)}>
              <FaTimes /> Close
            </button>
          </div>

              <div style={styles.appSummaryRow}>
                <div style={styles.summaryCard}>
                  <p style={styles.summaryLabel}>Total applications</p>
                  <p style={styles.summaryValue}>{applicationSummary.total}</p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.summaryLabel}>Pending</p>
                  <p style={styles.summaryValue}>{applicationSummary.pending}</p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.summaryLabel}>Accepted</p>
                  <p style={styles.summaryValue}>{applicationSummary.accepted}</p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.summaryLabel}>Rejected</p>
                  <p style={styles.summaryValue}>{applicationSummary.rejected}</p>
                </div>
              </div>

          {loadingApps ? (
            <div style={styles.loadingPanel}>
              <FaSpinner style={styles.spinner} />
              <p>Loading applications…</p>
            </div>
          ) : appError ? (
            <div style={styles.errorPanel}>
              <FaExclamationCircle style={{ marginRight: 10 }} />
              {appError}
            </div>
          ) : actionMessage ? (
            <div style={{
              ...styles.alert,
              ...(actionMessage.type === 'success' ? styles.alertSuccess : styles.alertError)
            }}>
              {actionMessage.text}
            </div>
          ) : applications.length === 0 ? (
            <div style={styles.emptyPanel}>
              <FaUsers style={styles.emptyIcon} />
              <h2>No applications yet</h2>
              <p>Once applicants submit for this vacancy, they will appear here.</p>
            </div>
          ) : (
            <div style={styles.applicationTable}>
              {applications.map((app) => (
                <div key={app.id} style={styles.applicationRow}>
                  <div style={styles.applicationMain}>
                    <p style={styles.applicationName}>{app.applicant_name || 'Applicant'}</p>
                    <p style={styles.applicationMeta}>{app.applicant_email || 'No email'} • {app.region || 'No region'}</p>
                    <p style={styles.applicationDetail}>{app.sector ? `Sector: ${app.sector}` : 'Sector not specified'}</p>
                    <p style={styles.applicationDetail}>Experience: {app.experience_years ?? 'Not stated'} years</p>
                    {app.skills ? <p style={styles.applicationDetail}>Skills: {app.skills}</p> : null}
                    {app.applicant_profile ? <p style={styles.applicationDetail}>{app.applicant_profile}</p> : null}
                  </div>
                  <div style={styles.applicationStatusRow}>
                    <span style={styles.statusBadge(app.status)}>{app.status || 'pending'}</span>
                    <span style={styles.applicationDate}>{new Date(app.applied_at).toLocaleDateString()}</span>
                    <div style={styles.actionButtons}>
                      <button
                        type="button"
                        style={{
                          ...styles.applicationActionButton,
                          ...styles.applicationAcceptButton,
                          ...(app.status !== 'pending' || statusUpdatingIds.includes(app.id) ? styles.disabledButton : {})
                        }}
                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                        disabled={app.status !== 'pending' || statusUpdatingIds.includes(app.id)}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        style={{
                          ...styles.applicationActionButton,
                          ...styles.applicationRejectButton,
                          ...(app.status !== 'pending' || statusUpdatingIds.includes(app.id) ? styles.disabledButton : {})
                        }}
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        disabled={app.status !== 'pending' || statusUpdatingIds.includes(app.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 32px',
    backgroundColor: '#f8fbff',
    fontFamily: 'Inter, Arial, sans-serif'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '18px',
    marginBottom: '28px',
    flexWrap: 'wrap'
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
    fontSize: '34px',
    margin: 0,
    color: '#0f172a',
    lineHeight: 1.05
  },
  description: {
    marginTop: '12px',
    color: '#475569',
    maxWidth: '700px',
    fontSize: '15px'
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 20px',
    backgroundColor: '#0b2545',
    color: '#fff',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: 700
  },
  backButton: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 18px',
    backgroundColor: '#eff6ff',
    color: '#0b2545',
    borderRadius: '14px',
    textDecoration: 'none',
    fontWeight: 700,
    marginTop: '14px'
  },
  loadingPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderRadius: '20px',
    padding: '24px',
    background: '#ffffff',
    color: '#475569',
    boxShadow: '0 12px 30px rgba(15,23,42,0.08)'
  },
  spinner: {
    fontSize: '24px',
    color: '#0ea5e9',
    animation: 'spin 1s linear infinite'
  },
  errorPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '22px',
    borderRadius: '18px',
    background: '#fee2e2',
    color: '#991b1b',
    marginBottom: '24px'
  },
  emptyPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '34px',
    borderRadius: '24px',
    background: '#ffffff',
    textAlign: 'center',
    color: '#334155',
    boxShadow: '0 16px 36px rgba(15,23,42,0.08)'
  },
  emptyIcon: {
    fontSize: '34px',
    color: '#0ea5e9'
  },
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  },
  jobCard: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 14px 34px rgba(15,23,42,0.08)',
    border: '1px solid rgba(148,163,184,0.18)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '18px'
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
    color: '#0f172a'
  },
  jobMeta: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: '14px'
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#0b2545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer'
  },
  jobStats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '18px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#0b2545',
    fontSize: '13px',
    fontWeight: 700
  },
  jobDescription: {
    margin: 0,
    color: '#475569',
    lineHeight: 1.75
  },
  appPanel: {
    marginTop: '30px',
    padding: '24px',
    borderRadius: '24px',
    background: '#ffffff',
    boxShadow: '0 14px 34px rgba(15,23,42,0.08)',
    border: '1px solid rgba(148,163,184,0.18)'
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  subTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    color: '#0f172a'
  },
  subText: {
    margin: '6px 0 0',
    color: '#64748b'
  },
  jobInfo: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '14px'
  },
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    background: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer'
  },
  applicationTable: {
    display: 'grid',
    gap: '16px'
  },
  appSummaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '14px',
    marginBottom: '22px'
  },
  summaryCard: {
    padding: '16px',
    borderRadius: '18px',
    background: '#eff6ff',
    border: '1px solid rgba(59,130,246,0.15)'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  applicationActionButton: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#ffffff',
    minWidth: '100px'
  },
  applicationAcceptButton: {
    backgroundColor: '#10b981'
  },
  applicationRejectButton: {
    backgroundColor: '#ef4444'
  },
  disabledButton: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },
  summaryLabel: {
    margin: 0,
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  summaryValue: {
    margin: '10px 0 0',
    fontSize: '24px',
    fontWeight: 800,
    color: '#0b2545'
  },
  applicationMain: {
    flex: 1,
    minWidth: 0
  },
  applicationDetail: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '14px',
    lineHeight: 1.6
  },
  applicationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '18px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  applicationName: {
    margin: 0,
    fontWeight: 700,
    color: '#0f172a'
  },
  applicationMeta: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: '14px'
  },
  applicationStatusRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  applicationDate: {
    color: '#64748b',
    fontSize: '13px'
  },
  statusBadge: (status) => ({
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '13px',
    color: status === 'accepted' ? '#165f46' : status === 'rejected' ? '#7f1d1d' : '#0c4a6e',
    backgroundColor:
      status === 'accepted'
        ? '#dcfce7'
        : status === 'rejected'
        ? '#fee2e2'
        : '#dbeafe'
  })
};

export default EmployerApplications;
