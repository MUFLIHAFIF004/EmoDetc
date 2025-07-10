
const express = require('express');
const { requireRole } = require('../roleMiddleware');
const roomModel = require('../models/roomModel');
const router = express.Router();

// Ambil semua room yang pernah diikuti user (join history)
router.get('/my/rooms', requireRole(['user']), async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  try {
    // Ambil semua room yang pernah diikuti user (masih join atau sudah keluar)
    const [rows] = await db.query(`
      SELECT rooms.id, rooms.name, rooms.code, rooms.ended,
        (SELECT COUNT(*) FROM room_members WHERE room_id = rooms.id AND user_id = ?) AS is_joined,
        (SELECT joined_at FROM room_members WHERE room_id = rooms.id AND user_id = ? LIMIT 1) AS joined_at
      FROM rooms
      JOIN (
        SELECT DISTINCT room_id FROM room_members WHERE user_id = ?
      ) AS user_rooms ON user_rooms.room_id = rooms.id
      ORDER BY joined_at DESC
    `, [userId, userId, userId]);
    res.json({ success: true, rooms: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal mengambil daftar room.' });
  }
});

// Cek status room user (apakah user sedang join room mana)
router.get('/my/active', requireRole(['user']), async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT rooms.id, rooms.name, rooms.code, rooms.ended
      FROM room_members
      JOIN rooms ON rooms.id = room_members.room_id
      WHERE room_members.user_id = ?
      ORDER BY room_members.joined_at DESC LIMIT 1
    `, [userId]);
    if (!rows.length) return res.json({ active: false });
    res.json({ active: true, room: rows[0] });
  } catch (err) {
    res.status(500).json({ active: false, error: 'Gagal cek status room.' });
  }
});

// Endpoint keluar room (user keluar dari room)
router.post('/:code/leave', requireRole(['user']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  const userId = req.user.id;
  try {
    const [roomRows] = await db.query('SELECT id FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
    const roomId = roomRows[0].id;
    await db.query('DELETE FROM room_members WHERE room_id = ? AND user_id = ?', [roomId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal keluar room.' });
  }
});

// End sesi room (leader only)
router.post('/:code/end', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  try {
    const [roomRows] = await db.query('SELECT id, leader_id, ended FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
    if (roomRows[0].leader_id !== req.user.id) return res.status(403).json({ success: false, error: 'Akses ditolak.' });
    if (roomRows[0].ended) return res.status(400).json({ success: false, error: 'Sesi sudah diakhiri.' });
    await db.query('UPDATE rooms SET ended = TRUE WHERE id = ?', [roomRows[0].id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal mengakhiri sesi.' });
  }
});

// Hapus room (hanya leader, hanya jika sudah di-end)
router.delete('/:code', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  try {
    const [roomRows] = await db.query('SELECT id, leader_id, ended FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
    if (roomRows[0].leader_id !== req.user.id) return res.status(403).json({ success: false, error: 'Akses ditolak.' });
    if (!roomRows[0].ended) return res.status(400).json({ success: false, error: 'Room hanya bisa dihapus setelah sesi diakhiri.' });
    await db.query('DELETE FROM rooms WHERE id = ?', [roomRows[0].id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal menghapus room.' });
  }
});

// User join room by code
router.post('/:code/join', requireRole(['user']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  const userId = req.user.id;
  try {
    // Cek room ada
    const [roomRows] = await db.query('SELECT id FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) return res.status(404).json({ success: false, error: 'Kode ruangan tidak ditemukan.' });
    const roomId = roomRows[0].id;
    // Cek sudah join?
    const [memberRows] = await db.query('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?', [roomId, userId]);
    if (memberRows.length) return res.json({ success: true, message: 'Sudah bergabung.' });
    // Insert ke room_members
    await db.query('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)', [roomId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal join ruangan.' });
  }
});
// Buat room baru (hanya leader)
router.post('/', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  const { name, desc } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama ruangan wajib diisi!' });
  try {
    const result = await roomModel.createRoom(db, {
      name,
      desc,
      leader_id: req.user.id
    });
    res.json({ success: true, code: result.code, id: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat ruangan.' });
  }
});


// Ambil anggota room berdasarkan kode room (sesuai frontend) -- HARUS DIDEFINISIKAN SEBELUM '/'
// Ambil anggota room + leader berdasarkan kode room
router.get('/:code/members', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  try {
    console.log('[DEBUG] Mencari room dengan kode:', code);
    const [roomRows] = await db.query('SELECT id, leader_id FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) {
      console.log('[DEBUG] Room tidak ditemukan:', code);
      return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
    }
    const roomId = roomRows[0].id;
    const leaderId = roomRows[0].leader_id;
    // Ambil anggota biasa
    const [members] = await db.query(`
      SELECT users.id, users.username as name, room_members.joined_at
      FROM room_members
      JOIN users ON users.id = room_members.user_id
      WHERE room_members.room_id = ?
      ORDER BY room_members.joined_at ASC
    `, [roomId]);
    // Ambil data leader
    const [leaderRows] = await db.query('SELECT id, username as name FROM users WHERE id = ?', [leaderId]);
    let leader = null;
    if (leaderRows.length) {
      leader = { id: leaderRows[0].id, name: leaderRows[0].name, isLeader: true };
    }
    // Gabungkan leader (di awal list)
    const membersWithLeader = leader ? [leader, ...members.map(m => ({...m, isLeader: false}))] : members;
    console.log('[DEBUG] Jumlah anggota ditemukan (termasuk leader):', membersWithLeader.length);
    res.json({ success: true, members: membersWithLeader });
  } catch (err) {
    console.error('[ERROR] Gagal mengambil anggota room:', err);
    res.status(500).json({ success: false, error: 'Gagal mengambil anggota room.', detail: err.message });
  }
});

// Endpoint kick anggota room (hanya leader room)
router.delete('/:code/members/:userId', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  const code = req.params.code;
  const userId = parseInt(req.params.userId);
  try {
    // Pastikan room milik leader yang sedang login
    const [roomRows] = await db.query('SELECT id, leader_id FROM rooms WHERE code = ?', [code]);
    if (!roomRows.length) return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' });
    const roomId = roomRows[0].id;
    const leaderId = roomRows[0].leader_id;
    if (req.user.id !== leaderId) return res.status(403).json({ success: false, error: 'Akses ditolak.' });
    if (userId === leaderId) return res.status(400).json({ success: false, error: 'Leader tidak bisa menghapus dirinya sendiri.' });
    // Hapus anggota dari room_members
    await db.query('DELETE FROM room_members WHERE room_id = ? AND user_id = ?', [roomId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal menghapus anggota.' });
  }
});

// List semua room milik leader
router.get('/', requireRole(['leader']), async (req, res) => {
  const db = req.app.get('db');
  try {
    const rooms = await roomModel.getRoomsByLeader(db, req.user.id);
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data room.' });
  }
});

module.exports = router;
