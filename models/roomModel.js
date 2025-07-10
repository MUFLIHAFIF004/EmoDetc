// models/roomModel.js
// Model untuk operasi database terkait rooms

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = {
  generateRoomCode,

  async createRoom(db, { name, desc, leader_id }) {
    let code;
    let exists = true;
    // Pastikan kode unik
    while (exists) {
      code = generateRoomCode();
      const [rows] = await db.query('SELECT id FROM rooms WHERE code = ?', [code]);
      exists = rows.length > 0;
    }
    const [result] = await db.query(
      'INSERT INTO rooms (name, `desc`, code, leader_id) VALUES (?, ?, ?, ?)',
      [name, desc, code, leader_id]
    );
    return { id: result.insertId, code };
  },

  async getRoomsByLeader(db, leader_id) {
    const [rows] = await db.query('SELECT * FROM rooms WHERE leader_id = ? ORDER BY created_at DESC', [leader_id]);
    return rows;
  }
};
