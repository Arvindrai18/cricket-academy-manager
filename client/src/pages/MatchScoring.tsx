import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MatchScoring = () => {
    const { id } = useParams();
    // Scoring State
    const [score, setScore] = useState({
        inning_number: 1, over_number: 0, ball_number: 1,
        striker_name: '', non_striker_name: '', bowler_name: '',
        runs_scored: 0, extras: 0, extra_type: 'NONE',
        is_wicket: false, wicket_type: ''
    });

    // Read-only logs
    const [balls, setBalls] = useState<any[]>([]);

    const fetchScorecard = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/matches/${id}/scorecard`);
            setBalls(res.data);

            // Basic Auto-increment logic based on last ball could go here
            if (res.data.length > 0) {
                const last = res.data[res.data.length - 1];
                // simplified logic for next ball
                let nextBall = last.ball_number + 1;
                let nextOver = last.over_number;
                if (nextBall > 6 && last.extra_type === 'NONE') {
                    nextBall = 1;
                    nextOver += 1;
                }
                setScore(prev => ({
                    ...prev,
                    inning_number: last.inning_number,
                    over_number: nextOver,
                    ball_number: nextBall,
                    striker_name: last.striker_name,
                    non_striker_name: last.non_striker_name,
                    bowler_name: last.bowler_name
                }));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchScorecard(); }, [id]);

    const handleBallSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/matches/ball', { ...score, match_id: id });
            fetchScorecard();
            // Reset for next ball (keep names)
            setScore(prev => ({
                ...prev,
                runs_scored: 0, extras: 0, extra_type: 'NONE',
                is_wicket: false, wicket_type: ''
            }));
        } catch (err) { alert('Error recording ball'); }
    };

    return (
        <div>
            <h1>Live Scoring - Match #{id}</h1>
            <div className="grid">
                <div className="card">
                    <h2>Record Delivery</h2>
                    <form onSubmit={handleBallSubmit}>
                        <div className="flex-between">
                            <div className="form-group">
                                <label>Inning</label>
                                <input type="number" value={score.inning_number} onChange={e => setScore({ ...score, inning_number: Number(e.target.value) })} style={{ width: '60px' }} />
                            </div>
                            <div className="form-group">
                                <label>Over</label>
                                <input type="number" value={score.over_number} onChange={e => setScore({ ...score, over_number: Number(e.target.value) })} style={{ width: '60px' }} />
                            </div>
                            <div className="form-group">
                                <label>Ball</label>
                                <input type="number" value={score.ball_number} onChange={e => setScore({ ...score, ball_number: Number(e.target.value) })} style={{ width: '60px' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Striker</label>
                            <input value={score.striker_name} onChange={e => setScore({ ...score, striker_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Bowler</label>
                            <input value={score.bowler_name} onChange={e => setScore({ ...score, bowler_name: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Runs Scored (Off Bat)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[0, 1, 2, 3, 4, 6].map(r => (
                                    <button
                                        type="button"
                                        key={r}
                                        className={score.runs_scored === r ? '' : 'secondary'}
                                        onClick={() => setScore({ ...score, runs_scored: r })}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <input type="checkbox" checked={score.is_wicket} onChange={e => setScore({ ...score, is_wicket: e.target.checked })} style={{ width: 'auto' }} /> Wicket Fall?
                            </label>
                        </div>

                        <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Record Ball</button>
                    </form>
                </div>

                <div className="card">
                    <h2>Ball-by-Ball</h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {balls.slice().reverse().map((b) => (
                            <div key={b.id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                <strong>{b.over_number}.{b.ball_number}</strong> - {b.bowler_name} to {b.striker_name}
                                <span style={{ float: 'right', fontWeight: 'bold' }}>
                                    {b.is_wicket ? 'WICKET' : `${b.runs_scored + b.extras} runs`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchScoring;
