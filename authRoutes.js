const express = require('express');
const bcrypt = require('bcrypt');

const userModel = require('./models/userModel');

module.exports = function(db) {
    const router = express.Router();

    // Register endpoint
    router.post('/register', async (req, res) => {
        try {
            console.log('Register BODY:', req.body);
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ error: 'Request body tidak ditemukan atau format salah' });
            }
            const { username, password, role } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username dan password wajib diisi' });
            }
            const taken = await userModel.isUsernameTaken(db, username);
            if (taken) {
                return res.status(409).json({ error: 'Username sudah terdaftar' });
            }
            const hash = await bcrypt.hash(password, 10);
            const userId = await userModel.createUser(db, { username, password: hash, role });
            res.json({ success: true, userId });
        } catch (err) {
            console.error('Register error:', err);
            res.status(500).json({ error: 'Gagal registrasi user' });
        }
    });

    // Login endpoint
    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username dan password wajib diisi' });
            }
            const user = await userModel.findByUsername(db, username);
            if (!user) {
                return res.status(401).json({ error: 'Username tidak ditemukan' });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Password salah' });
            }
            const { password: _, ...userData } = user;
            // Set session user
            req.session.user = userData;
            res.json({ success: true, user: userData });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Gagal login user' });
        }
    });
    // Logout endpoint (accept both POST and GET for compatibility)
    const logoutHandler = (req, res) => {
        req.session.destroy(() => {
            res.json({ success: true });
        });
    };
    router.post('/logout', logoutHandler);
    router.get('/logout', logoutHandler);
    // Endpoint untuk cek user login & role (frontend bisa fetch ini)
    router.get('/me', (req, res) => {
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
        res.json({ user: req.session.user });
    });

    return router;
};
