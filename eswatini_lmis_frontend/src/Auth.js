import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from './services/api';

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: '2' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const redirect = new URLSearchParams(window.location.search).get('redirect') || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      if (!res?.data?.token || !res?.data?.user) {
        throw new Error('Invalid login response');
      }

      const { token, user } = res.data;
      const actualRole = user.role_id;

      if (actualRole == null) {
        throw new Error('Unable to determine account role');
      }

      const roleLabel = (roleId) => {
        if (roleId === 1) return 'Admin';
        if (roleId === 2) return 'Employer';
        return 'Job Seeker';
      };

      const selectedRoleId = Number(form.role);
      const selectedRoleLabel = selectedRoleId === 2 ? 'Employer' : 'Job Seeker';
      const actualRoleLabel = roleLabel(actualRole);

      if (selectedRoleId !== actualRole) {
        if (actualRole === 1) {
          setError(
            <span>
              This account is registered as <strong>Admin</strong>. Please <Link to="/admin/login" style={styles.link}>sign in using the Admin login</Link>.
            </span>
          );
        } else {
          setError(
            `This account is registered as ${actualRoleLabel}, not ${selectedRoleLabel}. Please choose the correct login role.`
          );
        }
        return;
      }

      localStorage.setItem('lmis_token', token);
      localStorage.setItem('lmis_user', JSON.stringify(user));

      const roleRedirect = actualRole === 2 ? '/employer' : '/jobseekers';
      navigate(redirect || roleRedirect, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in as an employer or job seeker</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Login as</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={styles.input}
          >
            <option value="2">Employer</option>
            <option value="3">Job Seeker</option>
          </select>

          <p style={styles.helpText}>
            Choose the role you are logging in with.
          </p>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.cardNote}>
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} style={styles.link}>
            Register now
          </Link>
        </p>

        <p style={styles.cardNote}>
          Admin?{' '}
          <Link to="/admin/login" style={styles.link}>
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
};

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      if (!res?.data?.token || !res?.data?.user) {
        throw new Error('Invalid login response');
      }

      const { token, user } = res.data;
      const actualRole = user.role_id;

      if (actualRole == null) {
        throw new Error('Unable to determine account role');
      }

      if (actualRole !== 1) {
        setError('This account is not an admin account. Please use the regular login.');
        return;
      }

      localStorage.setItem('lmis_token', token);
      localStorage.setItem('lmis_user', JSON.stringify(user));
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Sign in to the admin dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.cardNote}>
          Not an admin?{' '}
          <Link to="/login" style={styles.link}>
            Regular login
          </Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const roleParam = new URLSearchParams(window.location.search).get('role');
  const initialRole = roleParam === 'employer' ? '2' : '3';

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '', role: initialRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const redirect = new URLSearchParams(window.location.search).get('redirect') || '/jobseekers';

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Full name and email are required');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await API.post('/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role_id: Number(form.role)
      });
      const roleLabel = form.role === '2' ? 'Employer' : 'Job Seeker';
      setSuccess(`${roleLabel} account created successfully for ${form.email.trim()}. Please sign in.`);
      setForm({ full_name: '', email: '', password: '', confirmPassword: '', role: initialRole });
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Register as an employer or job seeker</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Full name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Email address</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Register as</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={styles.input}
          >
            <option value="2">Employer</option>
            <option value="3">Job Seeker</option>
          </select>

          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Confirm password</label>
          <input
            type="password"
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.cardNote}>
          Already registered?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f4",
    padding: "30px"
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#fff",
    padding: "36px",
    borderRadius: "22px",
    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(15, 23, 42, 0.06)"
  },
  cardHeader: {
    marginBottom: "24px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0a1628"
  },
  subtitle: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.65
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  helpText: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "-4px",
    marginBottom: "8px"
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#475569",
    fontWeight: "600",
    marginBottom: "6px"
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none"
  },
  button: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#0f3b74",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s ease"
  },
  cardNote: {
    marginTop: "18px",
    fontSize: "14px",
    color: "#475569",
    textAlign: "center"
  },
  link: {
    color: "#0f3b74",
    fontWeight: "700",
    textDecoration: "none"
  },
  error: {
    color: "#b91c1c",
    fontSize: "13px",
    marginTop: "-8px"
  },
  success: {
    color: "#16a34a",
    fontSize: "13px",
    marginTop: "-8px"
  }
};