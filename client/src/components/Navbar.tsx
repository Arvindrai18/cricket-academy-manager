import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Trophy, Banknote, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">CricManager</Link>
            <div className="nav-links">
                <Link to="/" className={`nav-link ${isActive('/')}`}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/batches" className={`nav-link ${isActive('/batches')}`}>
                    <Users size={18} /> Batches
                </Link>
                <Link to="/students" className={`nav-link ${isActive('/students')}`}>
                    <GraduationCap size={18} /> Students
                </Link>
                <Link to="/attendance" className={`nav-link ${isActive('/attendance')}`}>
                    <CalendarCheck size={18} /> Attendance
                </Link>
                <Link to="/fees" className={`nav-link ${isActive('/fees')}`}>
                    <Banknote size={18} /> Fees
                </Link>
                <Link to="/matches" className={`nav-link ${isActive('/matches')}`}>
                    <Trophy size={18} /> Matches
                </Link>
                <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
