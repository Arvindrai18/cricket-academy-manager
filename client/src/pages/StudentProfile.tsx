import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#4CAF50', '#F44336', '#FFC107']; // Green, Red, Amber

const StudentProfile = () => {
    const { id } = useParams();
    // ... (omitting unchanged for brevity, but tool requires contiguous block, so I will target specific lines)
    // wait, I can just use two replace calls or a smaller context if contiguous?
    // The file is small enough, I'll just rewrite the top and the map.
    // Actually, let's just do top first.
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [attendanceStats, setAttendanceStats] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !id) return;

        const fetchData = async () => {
            try {
                // Fetch basic info (simplification: re-using bulk endpoint or we'd make a specific one. 
                // For now filtering from bulk list is inefficient but works for proto, 
                // but let's assume we add a specific GET /students/:id endpoint or filter client side.
                // Actually, let's implement a quick GET /api/students/details/:id on backend or just filter client side for now to save backend turn).
                // DECISION: I'll use the existing bulk fetch and filter client side to be safe without changing backend too much yet.
                const stuRes = await axios.get(`http://localhost:3000/api/students/${user.id}`);
                const found = stuRes.data.find((s: any) => s.id == id);
                setStudent(found);

                const payRes = await axios.get(`http://localhost:3000/api/payments/${user.id}`);
                setPayments(payRes.data.filter((p: any) => p.student_id == id));

                // Mocking attendance stats for visualization as we don't have a direct aggregation endpoint yet
                // In a real app we would fetch: GET /api/attendance/stats/:studentId
                setAttendanceStats([
                    { name: 'Present', value: 70 },
                    { name: 'Absent', value: 10 },
                    { name: 'Late', value: 20 },
                ]);

            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [user, id]);

    if (!student) return <div>Loading...</div>;

    return (
        <div>
            <h1>{student.first_name} {student.last_name}</h1>
            <p>Batch: {student.batch_name} | Role: {student.batting_style} / {student.bowling_style}</p>

            <div className="grid">
                <div className="card">
                    <h3>Personal Info</h3>
                    <p><strong>DOB:</strong> {student.dob}</p>
                    <p><strong>Parent Phone:</strong> {student.parent_phone}</p>
                    <p><strong>Status:</strong> {student.status}</p>
                </div>

                <div className="card">
                    <h3>Attendance Overview</h3>
                    <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center' }}>
                        <PieChart width={200} height={200}>
                            <Pie
                                data={attendanceStats}
                                cx={100}
                                cy={100}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {attendanceStats.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3>Fee History</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.payment_date}</td>
                                        <td>${p.amount}</td>
                                        <td>{p.payment_mode}</td>
                                        <td><span className={`badge ${p.status === 'PAID' ? 'active' : 'pending'}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                                {payments.length === 0 && <tr><td colSpan={4}>No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
