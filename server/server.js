const express = require('express');
const cors = require('cors');
const { getDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const academyRoutes = require('./routes/academies');
const batchRoutes = require('./routes/batches');
const studentRoutes = require('./routes/students');
const paymentRoutes = require('./routes/payments');
const matchRoutes = require('./routes/matches');
const attendanceRoutes = require('./routes/attendance');
const analyticsRoutes = require('./routes/analytics');

// Phase 1 Feature Routes
const performanceRoutes = require('./routes/performance');
const feeTemplateRoutes = require('./routes/fee-templates');
const coachRoutes = require('./routes/coaches');
const notificationRoutes = require('./routes/notifications');
const parentRoutes = require('./routes/parents');
const exportRoutes = require('./routes/exports');
const uploadRoutes = require('./routes/upload');

// Phase 2 Feature Routes
const trainingSessionRoutes = require('./routes/training-sessions');
const drillRoutes = require('./routes/drills');
const equipmentRoutes = require('./routes/equipment');
const tournamentRoutes = require('./routes/tournaments');
const roleRoutes = require('./routes/roles');

const { authenticateToken } = require('./middleware/auth');

const path = require('path');

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve uploads directory for profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/academies', academyRoutes); // Login/Register is public
app.use('/api/batches', authenticateToken, batchRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/matches', matchRoutes); // Mixed public/private
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Phase 1 Feature Routes
app.use('/api/performance', authenticateToken, performanceRoutes);
app.use('/api/fee-templates', authenticateToken, feeTemplateRoutes);
app.use('/api/coaches', authenticateToken, coachRoutes);
app.use('/api/notifications', notificationRoutes); // Mixed auth
app.use('/api/parents', parentRoutes); // Has public login/register
app.use('/api/exports', authenticateToken, exportRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);

// Phase 2 Feature Routes
app.use('/api/training-sessions', authenticateToken, trainingSessionRoutes);
app.use('/api/drills', authenticateToken, drillRoutes);
app.use('/api/equipment', authenticateToken, equipmentRoutes);
app.use('/api/tournaments', tournamentRoutes); // Mixed auth (viewing is public)
app.use('/api/roles', authenticateToken, roleRoutes);

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        const db = await getDB();
        console.log('Connected to SQLite database.');

        // Start automated schedulers
        const { startFeeReminderScheduler, startAttendanceAlertScheduler } = require('./services/schedulers');
        startFeeReminderScheduler();
        startAttendanceAlertScheduler();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});
