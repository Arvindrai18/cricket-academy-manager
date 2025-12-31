import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    batch_name: string;
    status: string;
}

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    // Form
    const [form, setForm] = useState({
        first_name: '', last_name: '', batch_id: '',
        parent_phone: '', dob: '', batting_style: '', bowling_style: ''
    });

    const refresh = async () => {
        if (!user) return;
        try {
            const [stuRes, batRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/students/${user.id}`),
                axios.get(`http://localhost:3000/api/batches/${user.id}`)
            ]);
            setStudents(stuRes.data);
            setBatches(batRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { refresh(); }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await axios.post('http://localhost:3000/api/students', { ...form, academy_id: user.id, batch_id: form.batch_id || null });
        setForm({ first_name: '', last_name: '', batch_id: '', parent_phone: '', dob: '', batting_style: '', bowling_style: '' });
        refresh();
    };

    return (
        <div>
            <div className="flex-between">
                <h1>Students (Academy: {user?.name})</h1>
            </div>

            <div className="grid">
                <div className="card">
                    <h2>Register Student</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="flex-between" style={{ gap: '1rem', marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>First Name</label>
                                <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Last Name</label>
                                <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Batch</label>
                            <select value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                                <option value="">Select Batch</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Parent Phone</label>
                            <input value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>DOB</label>
                            <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                        </div>
                        <div className="flex-between" style={{ gap: '1rem', marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Batting Style</label>
                                <input value={form.batting_style} onChange={e => setForm({ ...form, batting_style: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Bowling Style</label>
                                <input value={form.bowling_style} onChange={e => setForm({ ...form, bowling_style: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit">Add Student</button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h2>Student List</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Batch</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <Link to={`/students/${s.id}`} style={{ fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
                                                {s.first_name} {s.last_name}
                                            </Link>
                                        </td>
                                        <td>{s.batch_name || '-'}</td>
                                        <td><span className="badge active">{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Students;
