require('dotenv').config();
const axios = require('axios');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
// ...existing code...
// Koneksi pool ke database MySQL (edit user/password sesuai MySQL Anda)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'emodetc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Inisialisasi aplikasi
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});




// Session middleware (gunakan secret yang aman di production)
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'emodetc-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Middleware untuk mengisi req.user dari session
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
    }
    next();
});

// Inject db pool ke req.app
app.set('db', db);

// Room API
app.use('/api/rooms', require('./routes/roomRoutes'));



// Custom middleware
const { bodyParserMiddleware, errorHandlerMiddleware } = require('./customMiddleware');


// Routing auth (register & login) dengan middleware custom
const authRoutes = require('./authRoutes')(db);
// Hanya endpoint yang butuh JSON body yang pakai bodyParserMiddleware
app.use('/api/register', bodyParserMiddleware, authRoutes);
app.use('/api/login', bodyParserMiddleware, authRoutes);
// Endpoint lain (logout, me, dsb) tanpa bodyParserMiddleware
app.use('/api', authRoutes);

// Routing role-based (admin, leader, user)
const adminRoutes = require('./routes/adminRoutes');
const leaderRoutes = require('./routes/leaderRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/admin', adminRoutes);
app.use('/leader', leaderRoutes);
app.use('/user', userRoutes);

// Error handler global
app.use(errorHandlerMiddleware);

// Middleware error handler untuk respons JSON rapi
app.use((err, req, res, next) => {
    console.error('Error:', err.stack || err);
    if (res.headersSent) {
        return next(err);
    }
    // Jika error dari validasi body kosong
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body tidak valid (bukan JSON)' });
    }
    res.status(500).json({ error: 'Internal server error' });
});


// Konfigurasi
const PORT = process.env.PORT || 3000;
const MAX_MESSAGE_HISTORY = 100;

// Hapus konfigurasi Sentiment, tidak diperlukan lagi

// Simpan data pengguna dan pesan
const users = new Map(); // socket.id -> user data
const messageHistory = []; // Menyimpan riwayat pesan

// Fungsi untuk menambah pengguna
function addUser(socketId, userData) {
    users.set(socketId, {
        ...userData,
        joinedAt: new Date(),
        isTyping: false
    });
    return users.get(socketId);
}

// Fungsi untuk menghapus pengguna
function removeUser(socketId) {
    const user = users.get(socketId);
    if (user) {
        users.delete(socketId);
        return user;
    }
    return null;
}

// Fungsi untuk memperbarui daftar pengguna online
function updateOnlineUsers() {
    const onlineUsers = Array.from(users.values()).map(user => ({
        id: user.id,
        username: user.username,
        color: user.color
    }));
    io.emit('onlineUsers', onlineUsers);
}

// Fungsi untuk menghasilkan warna acak
function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Fungsi untuk menganalisis emosi (sementara: simple sentiment/hierarki, Gemini bisa diaktifkan via command)
async function analyzeEmotion(text) {
    // Jika ingin pakai Gemini, aktifkan kode di bawah ini:
    /*
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { originalText: text, emotion: 'neutral', error: 'GEMINI_API_KEY not set' };
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey;
    const prompt = `Kategorikan emosi utama dari pesan berikut sebagai salah satu dari: senang, sedih, marah, takut, netral. Jawab hanya dengan satu kata tersebut, tanpa penjelasan tambahan. Contoh:\n- \"Saya sangat senang hari ini\" → senang\n- \"Aku kecewa dan sedih\" → sedih\n- \"Aku marah sekali\" → marah\n- \"Aku takut sendirian\" → takut\n- \"Aku biasa saja\" → netral\nPesan: \"${text}\"`;
    const body = {
        contents: [
            { parts: [{ text: prompt }] }
        ]
    };
    try {
        const response = await axios.post(url, body);
        let result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        result = result.toLowerCase().replace(/[^a-zA-Z\u00C0-\u024F\s]/g, '').trim();
        if (result.includes('senang')) return { originalText: text, emotion: 'happy' };
        if (result.includes('sedih')) return { originalText: text, emotion: 'sad' };
        if (result.includes('marah')) return { originalText: text, emotion: 'angry' };
        if (result.includes('takut')) return { originalText: text, emotion: 'fearful' };
        return { originalText: text, emotion: 'neutral' };
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        return {
            originalText: text,
            emotion: 'neutral',
            error: error.response?.data || error.message
        };
    }
    */
    // Deteksi emosi populer chat Indonesia (prioritas: happy, sad, angry, fearful, neutral)
    const t = text.toLowerCase();
    // Happy
    if (
        /(wkwk|wk|haha|hehe|lol|ngakak|bahagia|gembira|senang|happy|asik|mantap|seru|hore|lucu|kocak|xd|:d|:\)|😊|😂|😁|😄|😆|😃|😹)/.test(t)
    ) return { originalText: text, emotion: 'happy' };
    // Sad
    if (
        /(sedih|kecewa|nangis|menangis|galau|down|patah hati|hiks|huhu|huft|terharu|sendu|murung|:\(|😢|😭|😞|😔|😟|😥|😿)/.test(t)
    ) return { originalText: text, emotion: 'sad' };
    // Angry
    if (
        /(marah|kesal|bt|bete|emosi|sebel|anjir|anjay|anjg|anj*|ngamuk|angry|grrr|😡|😠|😤|👿|💢)/.test(t)
    ) return { originalText: text, emotion: 'angry' };
    // Fearful
    if (
        /(takut|khawatir|cemas|parno|deg-degan|grogi|was-was|fear|nervous|😨|😰|😱|😖)/.test(t)
    ) return { originalText: text, emotion: 'fearful' };
    // Netral
    return { originalText: text, emotion: 'neutral' };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allow CORS for static files (for html2canvas image rendering)
app.use('/img', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// API untuk analisis emosi
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, userId, username } = req.body;
        
        if (!text || !userId || !username) {
            return res.status(400).json({ error: 'Text, userId, dan username diperlukan' });
        }
        
        // Analisis emosi
        const result = await analyzeEmotion(text);
        
        res.json({
            ...result,
            userId,
            username,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error analyzing text:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menganalisis teks' });
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle new user joining room
    socket.on('join', async (userData) => {
        const username = userData.username || 'Anonymous';
        // PATCH: support id dari frontend (id atau userId), dan pastikan number
        let userId = userData.id || userData.userId || socket.id;
        if (typeof userId === 'string' && !isNaN(Number(userId))) userId = Number(userId);
        if (typeof userId !== 'number' || isNaN(userId)) userId = null;
        let roomId = userData.roomId;
        if (!roomId) return;
        // Jika roomId bukan angka, asumsikan itu kode room, lookup ke DB
        if (typeof roomId === 'string' && isNaN(Number(roomId))) {
            const [[roomRow]] = await db.query('SELECT id FROM rooms WHERE code = ?', [roomId]);
            if (!roomRow) {
                socket.emit('systemMessage', {
                    type: 'error',
                    text: 'Kode room tidak ditemukan.'
                });
                return;
            }
            roomId = roomRow.id;
        }
        // Join socket.io room
        socket.join(roomId);
        // Tambahkan pengguna
        const user = addUser(socket.id, {
            id: userId,
            username: username,
            color: userData.color || getRandomColor(),
            roomId: roomId
        });
        // Kirim riwayat pesan room ke user baru (ambil dari DB)
        try {
            const [rows] = await db.query('SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 100', [roomId]);
            console.log(`[DEBUG] Emit messageHistory to socket ${socket.id} (room ${roomId}), rows:`, rows.length);
            socket.emit('messageHistory', rows);
            if (!rows || rows.length === 0) {
                console.warn(`[DEBUG] messageHistory: No messages found for room ${roomId}`);
            }
        } catch (err) {
            console.error(`[DEBUG] messageHistory error for room ${roomId}:`, err);
            socket.emit('messageHistory', []);
            socket.emit('systemMessage', {
                type: 'error',
                text: 'Gagal mengambil riwayat pesan dari server.'
            });
        }
        // Broadcast ke room: user baru join
        socket.to(roomId).emit('userJoined', {
            userId: user.id,
            username: user.username,
            timestamp: new Date().toISOString()
        });
        // Update daftar user online di room
        updateOnlineUsersRoom(roomId);
        console.log(`User joined room ${roomId}: ${username} (${socket.id})`);
    });
    
    // Handle pesan chat per room
    socket.on('chatMessage', async (messageData) => {
        try {
            // Ambil id dari messageData (frontend sekarang selalu kirim id, bukan userId)
            let dbUserId = messageData.id;
            if (typeof dbUserId === 'string' && !isNaN(Number(dbUserId))) dbUserId = Number(dbUserId);
            if (typeof dbUserId !== 'number' || isNaN(dbUserId)) {
                // fallback ke user memory
                const user = users.get(socket.id);
                dbUserId = user && typeof user.id === 'number' ? user.id : null;
            }
            const username = messageData.username || (users.get(socket.id)?.username) || 'Anonymous';
            const color = messageData.color || (users.get(socket.id)?.color) || getRandomColor();
            let roomId = messageData.roomId || (users.get(socket.id)?.roomId);
            // Jika roomId bukan angka, asumsikan itu kode room, lookup ke DB
            if (typeof roomId === 'string' && isNaN(Number(roomId))) {
                const [[roomRow]] = await db.query('SELECT id FROM rooms WHERE code = ?', [roomId]);
                if (!roomRow) {
                    socket.emit('systemMessage', {
                        type: 'error',
                        text: 'Kode room tidak ditemukan.'
                    });
                    return;
                }
                roomId = roomRow.id;
            }
            // Validasi id harus benar-benar ada di tabel users dan room_id di tabel rooms
            if (!roomId || !dbUserId) {
                console.warn('chatMessage: roomId atau userId tidak valid', { roomId, dbUserId });
                socket.emit('systemMessage', {
                    type: 'error',
                    text: 'Room atau user tidak valid. Silakan cek kembali.'
                });
                return;
            }
            // Cek ke database, pastikan userId valid
            const [[userRow]] = await db.query('SELECT id FROM users WHERE id = ?', [dbUserId]);
            if (!userRow) {
                console.warn('chatMessage: userId tidak ditemukan di tabel users', dbUserId);
                socket.emit('systemMessage', {
                    type: 'error',
                    text: 'User tidak ditemukan di database. Silakan login ulang.'
                });
                return;
            }
            // Cek ke database, pastikan roomId valid
            const [[roomRow]] = await db.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
            if (!roomRow) {
                console.warn('chatMessage: roomId tidak ditemukan di tabel rooms', roomId);
                socket.emit('systemMessage', {
                    type: 'error',
                    text: 'Room tidak ditemukan atau sudah dihapus.'
                });
                return;
            }
            // Analisis emosi pesan
            const analysis = await analyzeEmotion(messageData.text);
            // Simpan ke DB
            const [insertResult] = await db.query('INSERT INTO messages (room_id, user_id, text, emotion) VALUES (?, ?, ?, ?)', [roomId, dbUserId, messageData.text, analysis.emotion]);
            // Update/increment emotion_stats
            await db.query(`INSERT INTO emotion_stats (room_id, user_id, emotion, count) VALUES (?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE count = count + 1, updated_at = CURRENT_TIMESTAMP`, [roomId, dbUserId, analysis.emotion]);
            // Buat objek pesan untuk broadcast
            const message = {
                userId: dbUserId,
                username: username,
                color: color,
                text: messageData.text,
                timestamp: new Date().toISOString(),
                emotion: analysis.emotion
            };
            // Debug: log insert result
            console.log('[DEBUG] Pesan disimpan:', { insertId: insertResult.insertId, ...message });
            // Broadcast ke room saja
            io.to(roomId).emit('chatMessage', message);
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });
    
    // Handle typing indicator per room
    socket.on('typing', (data) => {
        const user = users.get(socket.id);
        const roomId = data && data.roomId;
        if (user && roomId) {
            user.isTyping = data.isTyping;
            socket.to(roomId).emit('userTyping', {
                userId: user.id,
                username: user.username,
                isTyping: data.isTyping
            });
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user && user.roomId) {
            socket.to(user.roomId).emit('userLeft', {
                userId: user.id,
                username: user.username,
                timestamp: new Date().toISOString()
            });
            updateOnlineUsersRoom(user.roomId);
            console.log(`User disconnected: ${user.username} (${socket.id})`);
        }
    });
});

// Update daftar user online per room
function updateOnlineUsersRoom(roomId) {
    const onlineUsers = Array.from(users.values())
        .filter(u => u.roomId === roomId)
        .map(user => ({
            id: user.id,
            username: user.username,
            color: user.color
        }));
    io.to(roomId).emit('onlineUsers', onlineUsers);
}

// Fallback route untuk user/room agar tidak 404 (SPA-like)
app.get('/user/room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-room.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
