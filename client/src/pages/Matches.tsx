import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Match {
    id: number;
    team_a_name: string;
    team_b_name: string;
    match_date: string;
    status: string;
    venue: string;
}

const Matches = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);

    const [form, setForm] = useState({
        team_a_name: '', team_b_name: '', venue: '', match_date: ''
    });

    const fetchMatches = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`http://localhost:3000/api/matches/${user.id}`);
            setMatches(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchMatches(); }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await axios.post('http://localhost:3000/api/matches', { ...form, academy_id: user.id });
        setForm({ team_a_name: '', team_b_name: '', venue: '', match_date: '' });
        fetchMatches();
    };

    return (
        <div>
            <div className="flex-between">
                <h1>Matches (Academy: {user?.name})</h1>
            </div>

            <div className="grid">
                <div className="card">
                    <h2>Schedule Match</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Team A</label>
                            <input value={form.team_a_name} onChange={e => setForm({ ...form, team_a_name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Team B</label>
                            <input value={form.team_b_name} onChange={e => setForm({ ...form, team_b_name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Venue</label>
                            <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="datetime-local" value={form.match_date} onChange={e => setForm({ ...form, match_date: e.target.value })} />
                        </div>
                        <button type="submit">Schedule</button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h2>Upcoming Logs</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Match</th>
                                    <th>Date</th>
                                    <th>Venue</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.team_a_name} vs {m.team_b_name}</td>
                                        <td>{new Date(m.match_date).toLocaleString()}</td>
                                        <td>{m.venue}</td>
                                        <td><span className={`badge ${m.status === 'LIVE' ? 'active' : 'pending'}`}>{m.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <Link to={`/matches/${m.id}/score`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                                    Score
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/live/${m.id}`;
                                                        navigator.clipboard.writeText(url);
                                                        alert('Public Match Link copied to clipboard!');
                                                    }}
                                                >
                                                    Share
                                                </button>
                                            </div>
                                        </td>
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

export default Matches;
