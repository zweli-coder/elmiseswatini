import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrash, FaUsers, FaSave, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminUsers = () => {
  const token = useMemo(() => localStorage.getItem('lmis_token'), []);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', role_id: 1 });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
    });
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ full_name: '', email: '', role_id: 1 });
    setMessage('');
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await API.put(`/admin/users/${id}`, formData);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...res.data, role_name: roleLabel(res.data.role_id) } : user)));
      setMessage('User updated successfully');
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this user? This cannot be undone.');
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const res = await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setMessage(res.data.message || 'User deleted successfully.');
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const roleLabel = (roleId) => {
    if (Number(roleId) === 1) return 'Admin';
    if (Number(roleId) === 2) return 'Employer';
    return 'Job Seeker';
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.sectionTag}>User Management</p>
          <h1 style={styles.title}>Manage Accounts</h1>
          <p style={styles.description}>
            View, edit, and delete system users directly from the admin dashboard.
          </p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/admin')}>
          <FaChevronLeft /> Back to Dashboard
        </button>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}
      {message && <div style={styles.alertSuccess}>{message}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.metaBlock}>
            <FaUsers style={styles.metaIcon} />
            <div>
              <p style={styles.metaLabel}>Total accounts</p>
              <p style={styles.metaValue}>{users.length}</p>
            </div>
          </div>
          <p style={styles.metaText}>Select a user to edit or delete existing accounts.</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading users…</p>
        ) : users.length === 0 ? (
          <p style={styles.loadingText}>No users found yet.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableRowHeader}>
              <div style={styles.cellName}>Name</div>
              <div style={styles.cellEmail}>Email</div>
              <div style={styles.cellRole}>Role</div>
              <div style={styles.cellActions}>Actions</div>
            </div>

            {users.map((user) => {
              const isEditing = editingId === user.id;
              return (
                <div key={user.id} style={styles.tableRow}>
                  <div style={styles.cellName}>
                    {isEditing ? (
                      <input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        style={styles.inputField}
                      />
                    ) : (
                      user.full_name
                    )}
                  </div>
                  <div style={styles.cellEmail}>
                    {isEditing ? (
                      <input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={styles.inputField}
                      />
                    ) : (
                      user.email
                    )}
                  </div>
                  <div style={styles.cellRole}>
                    {isEditing ? (
                      <select
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                        style={styles.selectField}
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Employer</option>
                        <option value={3}>Job Seeker</option>
                      </select>
                    ) : (
                      roleLabel(user.role_id)
                    )}
                  </div>
                  <div style={styles.cellActions}>
                    {isEditing ? (
                      <div style={styles.actionGroup}>
                        <button
                          type="button"
                          onClick={() => handleUpdate(user.id)}
                          disabled={saving}
                          style={styles.saveButton}
                        >
                          <FaSave style={styles.actionIcon} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={styles.cancelButton}
                        >
                          <FaTimes style={styles.actionIcon} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={styles.actionGroup}>
                        <button type="button" onClick={() => startEdit(user)} style={styles.editButton}>
                          <FaEdit style={styles.actionIcon} />
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(user.id)} style={styles.deleteButton}>
                          <FaTrash style={styles.actionIcon} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f7fb',
    padding: '40px 30px',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: '1200px',
    margin: '0 auto 24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionTag: {
    color: '#0ea5e9',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    fontSize: '12px',
  },
  title: {
    fontSize: '36px',
    margin: 0,
    color: '#103063',
    lineHeight: 1.08,
  },
  description: {
    color: '#475569',
    fontSize: '16px',
    marginTop: '14px',
    maxWidth: '760px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  metaBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  metaIcon: {
    fontSize: '28px',
    color: '#0f3b74',
  },
  metaLabel: {
    margin: 0,
    color: '#0f3b74',
    fontWeight: 700,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  metaValue: {
    margin: '4px 0 0',
    fontSize: '28px',
    color: '#103063',
    fontWeight: 800,
  },
  metaText: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },
  loadingText: {
    color: '#64748b',
    padding: '32px 0',
    textAlign: 'center',
  },
  tableWrapper: {
    width: '100%',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid rgba(15, 23, 42, 0.08)',
  },
  tableRowHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1.2fr',
    gap: '16px',
    backgroundColor: '#f8fafc',
    padding: '14px 18px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1.2fr',
    gap: '16px',
    alignItems: 'center',
    padding: '16px 18px',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
  },
  cellName: {
    color: '#0f172a',
    fontWeight: 600,
    wordBreak: 'break-word',
  },
  cellEmail: {
    color: '#475569',
    fontSize: '14px',
    wordBreak: 'break-word',
  },
  cellRole: {
    color: '#475569',
    fontSize: '14px',
    fontWeight: 600,
  },
  cellActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  inputField: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  selectField: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  actionGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  editButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: '1px solid #3b82f6',
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  saveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  cancelButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  deleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  actionIcon: {
    fontSize: '14px',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '14px 18px',
    borderRadius: '14px',
    marginBottom: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px',
  },
  alertSuccess: {
    backgroundColor: '#d1fae5',
    color: '#166534',
    padding: '14px 18px',
    borderRadius: '14px',
    marginBottom: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px',
  },
};

export default AdminUsers;
