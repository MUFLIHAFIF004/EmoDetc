
const express = require('express');
const path = require('path');
const { requireRole } = require('../roleMiddleware');

const router = express.Router();

// API: Ambil semua room milik leader (untuk dashboard)
router.get('/api/rooms', requireRole(['leader']), async (req, res) => {
    const db = req.app.get('db');
    const leaderId = req.session.user && req.session.user.id;
    if (!leaderId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    try {
        // Ambil semua room milik leader
        const [rooms] = await db.query('SELECT id, name, code FROM rooms WHERE leader_id = ? ORDER BY created_at DESC', [leaderId]);
        // Untuk setiap room, hitung jumlah anggota (dari room_members)
        for (const room of rooms) {
            const [members] = await db.query('SELECT COUNT(*) as count FROM room_members WHERE room_id = ?', [room.id]);
            room.memberCount = members[0].count;
        }
        res.json({ success: true, rooms });
    } catch (err) {
        console.error('Error ambil rooms leader:', err);
        res.status(500).json({ success: false, error: 'Gagal mengambil data rooms.' });
    }
});

// API: Ambil semua pesan dari semua room milik leader (untuk grafik dashboard)
router.get('/api/rooms/all-messages', requireRole(['leader']), async (req, res) => {
    const db = req.app.get('db');
    const leaderId = req.session.user && req.session.user.id;
    if (!leaderId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    try {
        // Ambil semua room id milik leader
        const [rooms] = await db.query('SELECT id FROM rooms WHERE leader_id = ?', [leaderId]);
        const roomIds = rooms.map(r => r.id);
        if (roomIds.length === 0) return res.json({ success: true, messages: [] });
        // Ambil semua pesan dari semua room
        const [messages] = await db.query(`
            SELECT m.id, m.user_id, m.room_id, m.text, m.emotion, m.created_at, u.username
            FROM messages m
            JOIN users u ON u.id = m.user_id
            WHERE m.room_id IN (${roomIds.map(() => '?').join(',')})
            ORDER BY m.created_at ASC
        `, roomIds);
        res.json({ success: true, messages });
    } catch (err) {
        console.error('Error ambil semua pesan rooms leader:', err);
        res.status(500).json({ success: false, error: 'Gagal mengambil data pesan.' });
    }
});

// (sudah dideklarasi di atas, hapus duplikat)
// Halaman export PDF statistik emosi ruangan (hanya leader)
router.get('/room/:code/export', requireRole(['leader']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leader-room-stats-export.html'));
});


// Dashboard leader (hanya leader)
router.get('/dashboard', requireRole(['leader']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leader-dashboard.html'));
});


// Halaman room (semua fitur room leader)
router.get('/room', requireRole(['leader']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leader-room.html'));
});

// Halaman anggota room (daftar anggota per room)
router.get('/room-members', requireRole(['leader']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leader-room-members.html'));
});

// Halaman statistik room (statistik emosi per room)
router.get('/room-stats', requireRole(['leader']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public/leader-room-stats.html'));
});

module.exports = router;


// API: Statistik emosi per room untuk leader
router.get('/api/rooms/:code/stats', requireRole(['leader']), async (req, res) => {
    const db = req.app.get('db');
    const roomCode = req.params.code;
    try {
        // Cari roomId dari kode room
        const [roomRows] = await db.query('SELECT id FROM rooms WHERE code = ?', [roomCode]);
        if (!roomRows.length) {
            return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
        }
        const roomId = roomRows[0].id;

        // Statistik agregat emosi di room (total per emosi)
        const [emotionRows] = await db.query(
            'SELECT emotion, SUM(count) as total FROM emotion_stats WHERE room_id = ? GROUP BY emotion',
            [roomId]
        );
        const stats = {};
        emotionRows.forEach(row => {
            stats[row.emotion] = row.total;
        });

        // Ambil data leader
        const [leaderRows] = await db.query('SELECT leader_id FROM rooms WHERE id = ?', [roomId]);
        let leaderId = leaderRows.length ? leaderRows[0].leader_id : null;
        let leaderData = null;
        if (leaderId) {
            const [rows] = await db.query(`
                SELECT u.id, u.username as name,
                    (SELECT emotion FROM emotion_stats WHERE user_id = u.id AND room_id = ? ORDER BY count DESC LIMIT 1) as dominant_emotion,
                    (SELECT SUM(count) FROM emotion_stats WHERE user_id = u.id AND room_id = ?) as message_count
                FROM users u
                WHERE u.id = ?
            `, [roomId, roomId, leaderId]);
            if (rows.length) {
                leaderData = rows[0];
            }
        }

        // Ambil semua user yang join room (kecuali leader)
        const [userRows] = await db.query(`
            SELECT u.id, u.username as name,
                (SELECT emotion FROM emotion_stats WHERE user_id = u.id AND room_id = ? ORDER BY count DESC LIMIT 1) as dominant_emotion,
                (SELECT SUM(count) FROM emotion_stats WHERE user_id = u.id AND room_id = ?) as message_count
            FROM users u
            JOIN room_members rm ON rm.user_id = u.id
            WHERE rm.room_id = ? AND u.id != ?
        `, [roomId, roomId, roomId, leaderId]);

        // Gabungkan leader di urutan pertama
        const userStats = leaderData ? [leaderData, ...userRows] : userRows;

        // Ambil semua pesan di room (untuk statistik & grafik akurat)
        const [messages] = await db.query(`
            SELECT m.id, m.user_id, m.text, m.emotion, m.created_at, u.username
            FROM messages m
            JOIN users u ON u.id = m.user_id
            WHERE m.room_id = ?
            ORDER BY m.created_at ASC
        `, [roomId]);

        res.json({ success: true, stats, userStats, leaderId, messages });
    } catch (err) {
        console.error('Error ambil statistik emosi room:', err);
        res.status(500).json({ success: false, error: 'Gagal mengambil data statistik room.' });
    }
});


// API statistik emosi & user per room untuk leader
router.get('/api/rooms/:code/stats', requireRole(['leader']), async (req, res) => {
    const db = req.app.get('db');
    const roomCode = req.params.code;
    try {
        // Cari roomId dari kode room
        const [roomRows] = await db.query('SELECT id FROM rooms WHERE code = ?', [roomCode]);
        if (!roomRows.length) {
            return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
        }
        const roomId = roomRows[0].id;

        // Statistik emosi agregat (total per emosi di room)
        const [emotionRows] = await db.query(
            'SELECT emotion, SUM(count) as total FROM emotion_stats WHERE room_id = ? GROUP BY emotion',
            [roomId]
        );
        const stats = {};
        emotionRows.forEach(row => { stats[row.emotion] = row.total; });

        // Statistik per user (nama, email, emosi dominan, jumlah pesan)
        const [userRows] = await db.query(`
            SELECT u.id, u.username as name, u.email, 
                (SELECT emotion FROM emotion_stats WHERE user_id = u.id AND room_id = ? ORDER BY count DESC LIMIT 1) as dominant_emotion,
                (SELECT SUM(count) FROM emotion_stats WHERE user_id = u.id AND room_id = ?) as message_count
            FROM users u
            JOIN room_members rm ON rm.user_id = u.id
            WHERE rm.room_id = ?
        `, [roomId, roomId, roomId]);

        res.json({ success: true, stats, userStats: userRows });
    } catch (err) {
        console.error('Error ambil statistik room leader:', err);
        res.status(500).json({ success: false, error: 'Gagal mengambil statistik room.' });
    }
});
