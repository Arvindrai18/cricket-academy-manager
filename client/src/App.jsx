import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, CreditCard, UserCog, Calendar,
    Trophy, Bell, Settings, LogOut, ChevronRight,
    Target, Dumbbell, ShieldCheck, Activity, LineChart,
    Video, FileText, Image, Mail, Smartphone
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full nav-button ${active ? 'bg-primary-600/20 text-primary-400 border-r-4 border-primary-500' : 'text-slate-400 hover:text-white'}`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
);

const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20',
};

const FeatureButton = ({ icon: Icon, label, description, color, onClick }) => (
    <button onClick={onClick} className="feature-grid-btn group">
        <div className={`p-4 rounded-2xl mb-4 ${colorMap[color]} group-hover:scale-110 transition-all duration-300`}>
            <Icon size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{label}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </button>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [systemStatus, setSystemStatus] = useState('Checking...');

    React.useEffect(() => {
        fetch('/api/health')
            .then(res => res.json())
            .then(data => setSystemStatus(data.status === 'UP' ? 'Connected' : 'Error'))
            .catch(() => setSystemStatus('Disconnected'));
    }, []);

    const features = [
        { id: 'students', icon: Users, label: 'Student Management', description: 'Profiles, Performance & Skills', color: 'blue' },
        { id: 'fees', icon: CreditCard, label: 'Fee Management', description: 'Payments, Templates & Reminders', color: 'emerald' },
        { id: 'training', icon: Dumbbell, label: 'Training Sessions', description: 'Scheduling, Drills & Attendance', color: 'orange' },
        { id: 'tournaments', icon: Trophy, label: 'Tournament Center', description: 'Brackets, Teams & Scoring', color: 'yellow' },
        { id: 'analytics', icon: BarChart3, label: 'Advanced Analytics', description: 'Retention, Revenue & Trends', color: 'indigo' },
        { id: 'marketing', icon: Bell, label: 'Communication Hub', description: 'Announcements & Notifications', color: 'rose' },
        { id: 'security', icon: ShieldCheck, label: 'Security & SaaS', description: 'Audit Logs & IP Whitelisting', color: 'cyan' },
        { id: 'coaches', icon: UserCog, label: 'Coach Management', description: 'Profiles & Assignments', color: 'purple' },
    ];

    return (
        <div className="p-8">
            <header className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Welcome Back, Academy Owner
                    </h1>
                    <p className="text-slate-400 mt-2">Manage your cricket academy from one unified dashboard.</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold border ${systemStatus === 'Connected' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>
                    Backend: {systemStatus}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f) => (
                    <FeatureButton key={f.id} {...f} onClick={() => console.log(`Navigating to ${f.id}`)} />
                ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Quick Actions</h2>
                        <button className="text-primary-400 text-sm hover:underline">View All</button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 font-medium transition-colors">Record Match Result</button>
                        <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-colors">Generate Fee Receipts</button>
                        <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-colors">Public Announcement</button>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-6">Live Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-slate-400">Match in Progress</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-2"><Activity size={16} /> LIVE</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-slate-400">Pending Reminders</span>
                            <span className="text-amber-400 font-bold">12 Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlaceholderView = ({ title, icon: Icon }) => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-10">
            <div className="flex items-center space-x-4 mb-2 text-primary-400">
                <Icon size={24} />
                <span className="text-sm font-bold uppercase tracking-wider">Module Active</span>
            </div>
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 mt-2">Loading historical data and real-time updates for {title}...</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-8 border border-white/5 h-64 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 mb-4 flex items-center justify-center animate-pulse">
                    <Icon className="text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">Syncing with Backend...</p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-white/5 h-64 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 mb-4 flex items-center justify-center animate-bounce">
                    <ShieldCheck className="text-emerald-400" />
                </div>
                <p className="text-emerald-400/80 font-medium">Database Optimized</p>
            </div>
        </div>
    </div>
);

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'students': return <PlaceholderView title="Student Directory" icon={Users} />;
            case 'finance': return <PlaceholderView title="Financial Ledger" icon={CreditCard} />;
            case 'training': return <PlaceholderView title="Training Schedules" icon={Dumbbell} />;
            case 'matches': return <PlaceholderView title="Match Statistics" icon={Trophy} />;
            case 'analytics': return <PlaceholderView title="Academy Analytics" icon={BarChart3} />;
            case 'notifications': return <PlaceholderView title="Communication Hub" icon={Bell} />;
            case 'settings': return <PlaceholderView title="System Settings" icon={Settings} />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/10 glass-card flex flex-col sticky top-0 h-screen">
                <div className="p-8 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Activity className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">CricManager</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <SidebarItem icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <SidebarItem icon={CreditCard} label="Finance" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
                    <SidebarItem icon={Dumbbell} label="Training" active={activeTab === 'training'} onClick={() => setActiveTab('training')} />
                    <SidebarItem icon={Trophy} label="Matches" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                    <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-6 border-t border-white/10">
                    <div className="p-4 rounded-2xl bg-white/5 mb-4">
                        <p className="text-xs text-slate-400 mb-1 leading-none tracking-widest uppercase font-bold">PRO PLAN</p>
                        <p className="text-sm font-semibold mt-1">Elite Academy v2.0</p>
                    </div>
                    <button className="flex items-center space-x-3 text-slate-400 hover:text-rose-400 transition-colors w-full px-4 py-2">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950/50">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;

