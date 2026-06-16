import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const authHeader = (token) => {
  if (!token) return {};
  return { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` };
};

// Add CSS for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .post-vacancy-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
  }
  .post-vacancy-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .post-vacancy-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .back-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  }
  .back-btn:active {
    transform: translateY(0);
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

const AdminVacancies = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    job_type: '',
    sector: '',
    organisation_name: '',
    duration_days: 30  // Default 30 days
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectors = [
    'Agriculture, Forestry and Fishing',
    'Mining and Quarrying',
    'Manufacturing',
    'Electricity, Gas, Steam and Air Conditioning Supply',
    'Water Supply, Sewerage, Waste Management and Remediation Activities',
    'Construction',
    'Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles',
    'Transportation and Storage',
    'Accommodation and Food Service Activities',
    'Information and Communication',
    'Financial and Insurance Activities',
    'Real Estate Activities',
    'Professional, Scientific and Technical Activities',
    'Administrative and Support Service Activities',
    'Public Administration and Defence; Compulsory Social Security',
    'Education',
    'Human Health and Social Work Activities',
    'Arts, Entertainment and Recreation',
    'Other Service Activities',
    'Activities of Households as Employers; Undifferentiated Goods and Services-Producing Activities of Households for Own Use',
    'Activities of Extraterritorial Organisations and Bodies',
    'Tourism'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('lmis_token');
    if (!token) {
      setStatus({ type: 'error', message: 'Please log in as an employer to post a vacancy.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/employers/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token)
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          job_type: form.job_type,
          sector: form.sector,
          salary: form.salary || null,
          requirements: form.requirements || null,
          application_deadline: form.application_deadline || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create vacancy');
      }

      setStatus({ type: 'success', message: 'Vacancy posted successfully.' });
      setForm({ title: '', description: '', location: '', job_type: '', sector: '', organisation_name: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to post vacancy.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.sectionTag}>Employer Vacancy</p>
          <h1 style={styles.title}>Post a New Job Vacancy</h1>
          <p style={styles.description}>Use this form to add a new vacancy as an employer.</p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/employer')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.formContainer}>
        {status && (
          <div style={{
            ...styles.alert,
            ...(status.type === 'success' ? styles.alertSuccess : styles.alertError)
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Organisation Name</label>
            <input
              type="text"
              name="organisation_name"
              value={form.organisation_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Job Type</label>
              <input
                type="text"
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Full-time, Part-time"
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Sector</label>
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select sector</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Duration (Days)</label>
              <input
                type="number"
                name="duration_days"
                value={form.duration_days}
                onChange={handleChange}
                style={styles.input}
                min="1"
                max="365"
                required
              />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                How many days should this vacancy be active?
              </small>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Job Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={styles.textarea}
              rows={8}
              required
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting} className="post-vacancy-btn">
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⟳</span>
                  Posting vacancy…
                </>
              ) : (
                'Post Vacancy'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 30px',
    backgroundColor: '#f3f7fb',
    fontFamily: 'Inter, Arial, sans-serif'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '32px',
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
    fontSize: '36px',
    margin: 0,
    color: '#0f172a',
    lineHeight: 1.05
  },
  description: {
    marginTop: '12px',
    color: '#475569',
    maxWidth: '720px',
    fontSize: '16px'
  },
  backBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(148, 163, 184, 0.18)'
  },
  alert: {
    padding: '16px 18px',
    borderRadius: '14px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  alertSuccess: {
    backgroundColor: '#d1fae5',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  submitBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default AdminVacancies;
