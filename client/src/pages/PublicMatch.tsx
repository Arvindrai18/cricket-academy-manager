import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PublicMatch = () => {
    const { id } = useParams();
    const [balls, setBalls] = useState<any[]>([]);

    const fetchScorecard = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/matches/${id}/scorecard`);
            setBalls(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchScorecard();
        const interval = setInterval(fetchScorecard, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [id]);

    // Calculate Summary
    const totalRuns = balls.reduce((acc, b) => acc + b.runs_scored + b.extras, 0);
    const wickets = balls.filter(b => b.is_wicket).length;
    // Simple over calculation
    const validBalls = balls.filter(b => b.extra_type === 'NONE' || b.extra_type === 'BYE' || b.extra_type === 'LEGBYE'); // Wides/NoBalls don't count to over
    const overs = Math.floor(validBalls.length / 6) + '.' + (validBalls.length % 6);

    const lastBall = balls[balls.length - 1];

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Live Match Center</h1>
                <p style={{ color: '#7f8c8d' }}>Match #{id}</p>

                <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#ecf0f1', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '3rem', margin: '0', color: '#2980b9' }}>
                        {totalRuns}/{wickets}
                    </h2>
                    <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>Overs: {overs}</p>
                    {lastBall && (
                        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                            Last Ball: <strong>{lastBall.bowler_name}</strong> to <strong>{lastBall.striker_name}</strong>
                            ({lastBall.runs_scored + lastBall.extras} runs {lastBall.is_wicket ? ' - WICKET!' : ''})
                        </p>
                    )}
                </div>

                <h3>Ball-by-Ball Commentary</h3>
                <div style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto', borderTop: '1px solid #eee' }}>
                    {balls.slice().reverse().map((b) => (
                        <div key={b.id} style={{ padding: '0.8rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>
                                <strong>{b.over_number}.{b.ball_number}</strong> {b.bowler_name} to {b.striker_name}
                            </span>
                            <span style={{ fontWeight: 'bold', color: b.is_wicket ? 'red' : 'black' }}>
                                {b.is_wicket ? 'OUT' : (b.runs_scored + b.extras)}
                            </span>
                        </div>
                    ))}
                    {balls.length === 0 && <p style={{ textAlign: 'center', padding: '1rem' }}>Match hasn't started yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default PublicMatch;
