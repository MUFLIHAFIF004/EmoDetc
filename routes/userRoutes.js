
const express = require('express');
const path = require('path');
const { requireRole } = require('../roleMiddleware');
const router = express.Router();


// Dashboard user (hanya user)
router.get('/dashboard', requireRole(['user']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user-dashboard.html'));
});

// Statistik emosi user (hanya user)
router.get('/stats', requireRole(['user']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user-stats.html'));
});


// Halaman join room (form input kode)
router.get('/room', requireRole(['user']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user-room.html'));
});

// API: Statistik emosi user per room (ambil dari tabel emotion_stats)
router.get('/api/rooms/:roomCode/user-stats', requireRole(['user']), async (req, res) => {
    const db = req.app.get('db');
    const userId = req.user && req.user.id;
    const roomCode = req.params.roomCode;
    console.log('DEBUG | userId:', userId, '| roomCode:', roomCode);
    if (!userId || !roomCode) {
        return res.status(400).json({ error: 'userId dan roomCode wajib diisi' });
    }
    try {
        // Cari roomId dari kode room (log hasil query)
        const [roomRows] = await db.query('SELECT id, code FROM rooms WHERE code = ?', [roomCode]);
        console.log('DEBUG | Hasil query rooms:', roomRows);
        if (!roomRows.length) {
            return res.status(404).json({ error: 'Room tidak ditemukan.' });
        }
        const roomId = roomRows[0].id;
        // Ambil statistik emosi user di room tersebut
        const [rows] = await db.query(
            'SELECT emotion, count FROM emotion_stats WHERE user_id = ? AND room_id = ?',
            [userId, roomId]
        );
        console.log('DEBUG | Hasil query emotion_stats:', rows);
        if (!rows.length) {
            return res.json({ stats: [], message: 'Belum ada data emosi untuk room ini.' });
        }
        res.json({ stats: rows });
    } catch (err) {
        console.error('Error ambil statistik emosi user:', err);
        res.status(500).json({ error: 'Gagal mengambil data statistik emosi.' });
    }
});

module.exports = router;
