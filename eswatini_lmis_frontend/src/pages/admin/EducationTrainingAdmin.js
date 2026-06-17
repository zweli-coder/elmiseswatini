import React, { useEffect, useState } from 'react';

const EducationTrainingAdmin = () => {

    const [data, setData] = useState([]);
    const [form, setForm] = useState({
        title: '',
        category: '',
        description: ''
    });

    const [editingId, setEditingId] = useState(null);

    const API = 'https://elmiseswatini-backend.onrender.com/api/education-training';

    // FETCH DATA
    const fetchData = () => {
        fetch(API)
            .then(res => res.json())
            .then(setData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // HANDLE INPUT
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // CREATE OR UPDATE
    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API}/${editingId}` : API;

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        });

        setForm({ title: '', category: '', description: '' });
        setEditingId(null);
        fetchData();
    };

    // DELETE
    const handleDelete = async (id) => {
        await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        fetchData();
    };

    // EDIT
    const handleEdit = (item) => {
        setForm({
            title: item.title,
            category: item.category,
            description: item.description
        });

        setEditingId(item.id);
    };

    return (

        <div style={{ padding: 30 }}>

            <h2>Education & Training Admin</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>

                <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                />

                <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                />

                <input
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                />

                <button type="submit">
                    {editingId ? 'Update' : 'Add'}
                </button>

            </form>

            {/* TABLE */}
            <table border="1" cellPadding="10" width="100%">

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
                                <button onClick={() => handleEdit(item)}>
                                    Edit
                                </button>

                                <button onClick={() => handleDelete(item.id)}>
                                    Delete
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>

            </table>

        </div>

    );

};

export default EducationTrainingAdmin;