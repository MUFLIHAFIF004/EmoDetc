// models/userModel.js

// Model User untuk operasi database terkait user
module.exports = {
    async findByUsername(db, username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
    },
    async createUser(db, { username, password, role }) {
        const [result] = await db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, password, role || 'user']
        );
        return result.insertId;
    },
    async isUsernameTaken(db, username) {
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        return rows.length > 0;
    }
};
