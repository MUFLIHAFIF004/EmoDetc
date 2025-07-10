// authMiddleware.js
// Middleware untuk mengisi req.user dari session atau JWT
// (Contoh: dari session, bisa diadaptasi ke JWT jika perlu)

function mockUserFromSession(req, res, next) {
    // ---
    // GANTI dengan implementasi asli: ambil user dari session/JWT
    // Untuk demo, bisa pakai req.headers['x-mock-user'] = '{"id":1,"username":"admin","role":"admin"}'
    // ---
    const mock = req.headers['x-mock-user'];
    if (mock) {
        try {
            req.user = JSON.parse(mock);
        } catch (e) {
            req.user = null;
        }
    }
    next();
}

module.exports = { mockUserFromSession };
