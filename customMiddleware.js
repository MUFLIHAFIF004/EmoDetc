// customMiddleware.js

// Middleware untuk parsing body dan validasi JSON
function bodyParserMiddleware(req, res, next) {
    // express.json() dan express.urlencoded() sudah diaktifkan di server.js
    // Middleware ini bisa digunakan untuk validasi tambahan jika perlu
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            return res.status(400).json({ error: 'Content-Type harus application/json' });
        }
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body tidak ditemukan atau format salah' });
        }
    }
    next();
}

// Middleware error handler global
function errorHandlerMiddleware(err, req, res, next) {
    console.error('Error:', err.stack || err);
    if (res.headersSent) {
        return next(err);
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body tidak valid (bukan JSON)' });
    }
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
    bodyParserMiddleware,
    errorHandlerMiddleware
};
