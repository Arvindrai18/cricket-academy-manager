import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Payment {
    id: number;
    student_id: number;
    first_name: string;
    last_name: string;
    amount: number;
    payment_date: string;
    status: string;
    due_date: string;
}

const Fees = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Form
    const [form, setForm] = useState({
        student_id: '', amount: '', due_date: '', payment_date: '', payment_mode: 'UPI', status: 'PAID'
    });

    const refreshData = async () => {
        if (!user) return;
        try {
            const [payRes, stuRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/payments/${user.id}`),
                axios.get(`http://localhost:3000/api/students/${user.id}`)
            ]);
            setPayments(payRes.data);
            setStudents(stuRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { refreshData(); }, [user]);

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await axios.post('http://localhost:3000/api/payments', { ...form, academy_id: user.id });
            alert('Payment Recorded');
            setForm({ student_id: '', amount: '', due_date: '', payment_date: '', payment_mode: 'UPI', status: 'PAID' });
            refreshData();
        } catch (err) { alert('Failed to record payment'); }
    };

    const handleOnlinePayment = async (payment: Payment) => {
        try {
            // 1. Create Order
            const { data: order } = await axios.post('http://localhost:3000/api/payments/create-order', {
                amount: payment.amount,
                receipt: `receipt_${payment.id}`
            });

            // 2. Open Razorpay
            const options = {
                key: 'rzp_test_placeholder', // Use env var in real app
                amount: order.amount,
                currency: order.currency,
                name: 'Cricket Academy',
                description: 'Fee Payment',
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        await axios.post('http://localhost:3000/api/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            payment_db_id: payment.id
                        });
                        alert('Payment Successful!');
                        refreshData();
                    } catch (err) {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: `${payment.first_name} ${payment.last_name}`,
                    contact: '9999999999' // Ideally fetch from student data
                },
                theme: { color: '#3399cc' }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            alert('Could not initiate payment');
        }
    };

    return (
        <div>
            <h1>Fee Management</h1>
            <div className="grid">
                <div className="card">
                    <h2>Record Payment</h2>
                    <form onSubmit={handleRecordPayment}>
                        <div className="form-group">
                            <label>Student</label>
                            <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required>
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-between" style={{ gap: '1rem', marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Amount</label>
                                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Mode</label>
                                <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
                                    <option value="UPI">UPI</option>
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex-between" style={{ gap: '1rem', marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Payment Date</label>
                                <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Due Date (if pending)</label>
                                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit">Record Transaction</button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h2>Transaction History</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.first_name} {p.last_name}</td>
                                        <td>${p.amount}</td>
                                        <td>{p.payment_date || p.due_date}</td>
                                        <td>
                                            <span className={`badge ${p.status === 'PAID' ? 'active' : 'pending'}`}>
                                                {p.status}
                                            </span>
                                            {p.status !== 'PAID' && (
                                                <button
                                                    onClick={() => handleOnlinePayment(p)}
                                                    style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                                                >
                                                    Pay Online
                                                </button>
                                            )}
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

export default Fees;
