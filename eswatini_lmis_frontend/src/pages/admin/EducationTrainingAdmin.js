import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINT } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationCircle, FaChevronLeft, FaBookOpen } from 'react-icons/fa';
import './EducationTrainingAdmin.css';

const EducationTrainingAdmin = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [form, setForm] = useState({ title: '', category: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API = `${API_ENDPOINT}/education-training`;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [API]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API}/${editingId}` : API;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} item.`);
            setForm({ title: '', category: '', description: '' });
            setEditingId(null);
            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete item.');
                await fetchData();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleEdit = (item) => {
        setForm({ title: item.title, category: item.category, description: item.description });
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="et-admin-page">
            <div className="et-admin-header">
                <button className="et-admin-back-btn" onClick={() => navigate('/admin')}>
                    <FaChevronLeft /> Back to Dashboard
                </button>
                <h1><FaBookOpen /> Education & Training Admin</h1>
                <p>Add, edit, or delete education and training programs.</p>
            </div>

            {error && <div className="et-admin-error-message"><FaExclamationCircle /> {error}</div>}

            <div className="et-admin-form-card">
                <h3>{editingId ? 'Edit Program' : 'Add New Program'}</h3>
                <form onSubmit={handleSubmit} className="et-admin-form">
                    <div className="et-admin-form-group">
                        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="et-admin-input" required />
                    </div>
                    <div className="et-admin-form-group">
                        <input name="category" placeholder="Category (e.g., Vocational, University)" value={form.category} onChange={handleChange} className="et-admin-input" required />
                    </div>
                    <div className="et-admin-form-group">
                        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="et-admin-textarea" required />
                    </div>
                    <div className="et-admin-button-group">
                        {editingId && <button type="button" className="et-admin-cancel-btn" onClick={() => { setEditingId(null); setForm({ title: '', category: '', description: '' }); }}>Cancel Edit</button>}
                        <button type="submit" className="et-admin-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : (editingId ? <FaEdit /> : <FaPlus />)}
                            {editingId ? 'Update Program' : 'Add Program'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="et-admin-table-container">
                <h3>Existing Programs</h3>
                {isLoading ? (
                    <div className="et-admin-loading"><FaSpinner className="spinner" /> Loading data...</div>
                ) : (
                    <table className="et-admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>{item.category}</td>
                                    <td>{item.description}</td>
                                    <td>
                                        <div className="et-admin-action-buttons">
                                            <button className="et-admin-edit-btn" onClick={() => handleEdit(item)}><FaEdit /> Edit</button>
                                            <button className="et-admin-delete-btn" onClick={() => handleDelete(item.id)}><FaTrash /> Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EducationTrainingAdmin;