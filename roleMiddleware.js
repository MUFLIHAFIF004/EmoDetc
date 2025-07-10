// roleMiddleware.js
// Middleware otorisasi role berbasis session/JWT (req.user)
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: role tidak diizinkan' });
        }
        next();
    };
}

// Middleware autentikasi (harus login)
function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

module.exports = { requireRole, requireAuth };
