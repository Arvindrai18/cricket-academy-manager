const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDB } = require('../db');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `student_${req.params.studentId}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
    }
});

// Upload Student Profile Picture
router.post('/:studentId', upload.single('profile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = `/uploads/profiles/${req.file.filename}`;

        const db = await getDB();
        await db.run(
            'UPDATE students SET profile_picture = ? WHERE id = ?',
            [filePath, req.params.studentId]
        );

        res.json({ message: 'Profile picture uploaded', path: filePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
