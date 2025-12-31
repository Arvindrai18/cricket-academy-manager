import { useState } from 'react';
import axios from 'axios';

const Academies = () => {
    // Note: Since we don't have a specific "get all academies" (admin) endpoint in the initial routes 
    // (we had "get by ID" or similar implied logic in login), 
    // I will mock the fetches or assuming we will add an endpoint if needed.
    // For now, let's add a form to Create Academy (Register).

    // Actually, let's create a "Register Academy" form here.
    const [formData, setFormData] = useState({
        name: '', owner_name: '', email: '', password: '', phone: '', subscription_plan: 'FREE'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/academies/register', formData);
            alert('Academy Registered!');
            setFormData({ name: '', owner_name: '', email: '', password: '', phone: '', subscription_plan: 'FREE' });
        } catch (err: any) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div>
            <h1>Academies</h1>
            <div className="grid">
                <div className="card">
                    <h2>Register New Academy</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Academy Name</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Owner Name</label>
                            <input value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email (Username)</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Plan</label>
                            <select value={formData.subscription_plan} onChange={e => setFormData({ ...formData, subscription_plan: e.target.value })}>
                                <option value="FREE">Free</option>
                                <option value="PREMIUM">Premium</option>
                            </select>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Academies;
