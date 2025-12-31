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

const { authenticateToken } = require('./middleware/auth');

const attendanceRoutes = require('./routes/attendance');
const analyticsRoutes = require('./routes/analytics');

const path = require('path');

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api/academies', academyRoutes); // Login/Register is public
app.use('/api/batches', authenticateToken, batchRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/matches', matchRoutes); // Mixed public/private
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

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
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});
