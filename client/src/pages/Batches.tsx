import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Batch {
    id: number;
    name: string;
    schedule_time: string;
    coach_name: string;
}

const Batches = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState<Batch[]>([]);

    const [form, setForm] = useState({ name: '', schedule_time: '', coach_name: '' });

    const fetchBatches = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`http://localhost:3000/api/batches/${user.id}`);
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await axios.post('http://localhost:3000/api/batches', { ...form, academy_id: user.id });
        setForm({ name: '', schedule_time: '', coach_name: '' });
        fetchBatches();
    };

    return (
        <div>
            <div className="flex-between">
                <h1>Batches (Academy: {user?.name})</h1>
            </div>

            <div className="grid">
                <div className="card">
                    <h2>Add Batch</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Batch Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Batch" required />
                        </div>
                        <div className="form-group">
                            <label>Schedule Time</label>
                            <input value={form.schedule_time} onChange={e => setForm({ ...form, schedule_time: e.target.value })} placeholder="e.g. 6AM - 9AM" />
                        </div>
                        <div className="form-group">
                            <label>Coach Name</label>
                            <input value={form.coach_name} onChange={e => setForm({ ...form, coach_name: e.target.value })} />
                        </div>
                        <button type="submit">Create Batch</button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h2>Existing Batches</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Schedule</th>
                                    <th>Coach</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.name}</td>
                                        <td>{b.schedule_time}</td>
                                        <td>{b.coach_name}</td>
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

export default Batches;
