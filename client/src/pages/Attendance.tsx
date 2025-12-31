import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<number, string>>({});

    useEffect(() => {
        if (!user) return;
        axios.get(`http://localhost:3000/api/batches/${user.id}`).then(res => setBatches(res.data));
    }, [user]);

    useEffect(() => {
        if (!user || !selectedBatch) return;

        // Fetch students in batch
        axios.get(`http://localhost:3000/api/students/${user.id}`).then(res => {
            const batchStudents = res.data.filter((s: any) => s.batch_id == selectedBatch);
            setStudents(batchStudents);

            // Initialize default 'PRESENT'
            const initialStatus: Record<number, string> = {};
            batchStudents.forEach((s: any) => initialStatus[s.id] = 'PRESENT');
            setAttendance(initialStatus);

            // Fetch existing attendance if any
            axios.get(`http://localhost:3000/api/attendance/${selectedBatch}/${date}`).then(attRes => {
                const existing = attRes.data;
                if (existing.length > 0) {
                    const statusMap: Record<number, string> = {};
                    existing.forEach((r: any) => statusMap[r.student_id] = r.status);
                    setAttendance(prev => ({ ...prev, ...statusMap }));
                }
            });
        });

    }, [selectedBatch, date, user]);

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        const records = Object.entries(attendance).map(([sid, status]) => ({
            student_id: Number(sid),
            status
        }));

        try {
            await axios.post('http://localhost:3000/api/attendance', {
                batch_id: selectedBatch,
                date,
                records
            });
            alert('Attendance Saved');
        } catch (err) { console.error(err); alert('Failed to save'); }
    };

    return (
        <div>
            <h1>Attendance</h1>
            <div className="card">
                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Select Batch</label>
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={{ minWidth: '200px' }}>
                            <option value="">-- Choose Batch --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {selectedBatch && (
                <div className="card" style={{ marginTop: '1rem' }}>
                    <h2>Mark Attendance</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.first_name} {s.last_name}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                                                    <label key={status} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <input
                                                            type="radio"
                                                            name={`att-${s.id}`}
                                                            checked={attendance[s.id] === status}
                                                            onChange={() => handleStatusChange(s.id, status)}
                                                        />
                                                        {status}
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && <tr><td colSpan={2}>No students in this batch.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {students.length > 0 && (
                        <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>Save Attendance</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;
