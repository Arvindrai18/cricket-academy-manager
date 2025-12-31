import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalBatches: 0,
        totalMatches: 0,
        totalRevenue: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/analytics/stats'),
                    axios.get('http://localhost:3000/api/analytics/revenue-chart')
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [user]);

    return (
        <div>
            <h1>Dashboard ({user?.name})</h1>
            <div className="grid">
                <div className="card">
                    <h3>Total Students</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalStudents}</p>
                </div>
                <div className="card">
                    <h3>Active Batches</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalBatches}</p>
                </div>
                <div className="card">
                    <h3>Matches Scheduled</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalMatches}</p>
                </div>
                <div className="card">
                    <h3>Total Revenue</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${stats.totalRevenue}</p>
                </div>

                <div className="card" style={{ gridColumn: 'span 2', height: '400px' }}>
                    <h3>Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="var(--primary)" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
