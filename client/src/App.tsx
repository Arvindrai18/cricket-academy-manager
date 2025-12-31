import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Academies from './pages/AcademyPage';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Matches from './pages/Matches';
import MatchScoring from './pages/MatchScoring';
import LoginPage from './pages/LoginPage';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import StudentProfile from './pages/StudentProfile';
import PublicMatch from './pages/PublicMatch';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/academies';

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/academies" element={<Academies />} />
          <Route path="/live/:id" element={<PublicMatch />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id/score" element={<MatchScoring />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
