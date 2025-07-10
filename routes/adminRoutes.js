
const express = require('express');
const path = require('path');
const { requireRole } = require('../roleMiddleware');
const router = express.Router();

// API: List semua room (untuk admin dashboard)
router.get('/api/rooms', requireRole(['admin']), async (req, res) => {
    const db = req.app.get('db');
    try {
        const [rows] = await db.query('SELECT id, code, name FROM rooms ORDER BY created_at DESC');
        res.json({ success: true, rooms: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Gagal mengambil data room.' });
    }
});

// API: Semua pesan dari semua room (untuk statistik emosi per room di admin dashboard)
router.get('/api/rooms/all-messages', requireRole(['admin']), async (req, res) => {
    const db = req.app.get('db');
    try {
        const [rows] = await db.query('SELECT id, room_id, user_id, username, text, emotion, created_at FROM messages ORDER BY created_at ASC');
        res.json({ success: true, messages: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Gagal mengambil data pesan.' });
    }
});

// Dashboard admin (hanya admin)
router.get('/dashboard', requireRole(['admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard-admin.html'));
});

// Contoh route admin lain
// router.get('/manage-users', requireRole(['admin']), ...);


// API: List semua user
router.get('/api/users', requireRole(['admin']), async (req, res) => {
    const db = req.app.get('db');
    try {
        const [rows] = await db.query('SELECT id, username, role FROM users ORDER BY id ASC');
        // Tambahkan kolom email: null agar frontend tidak error
        const users = rows.map(u => ({ ...u, email: null }));
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Gagal mengambil data user.' });
    }
});

// API: Ganti role user
router.put('/api/users/:id/role', requireRole(['admin']), async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin','leader','user'].includes(role)) return res.status(400).json({ success: false, error: 'Role tidak valid.' });
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Gagal update role.' });
    }
});

// API: Hapus user
router.delete('/api/users/:id', requireRole(['admin']), async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Gagal menghapus user.' });
    }
});

module.exports = router;
