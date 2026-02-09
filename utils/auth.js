const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verifyAccess, signAccess, signRefresh } = require('./jwt');
const { refreshTokens, saveRefresh, addAudit, users } = require('./db');
require('dotenv').config();

function authenticate(req, next) {
    const auth = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!auth) return next({ status: 401, message: 'No token' });
    try {
        req.user = verifyAccess(auth);
        next();
    } catch (err) {
        next({ status: 403, message: 'Invalid token' });
    }
}

function requireRole(role) {
    return (req, next) => {
        if (req.user.role !== role) return next({ status: 403, message: 'Insufficient role' });
        next();
    };
}

function refreshTokenHandler(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.writeHead(400).end(JSON.stringify({ error: 'Missing refreshToken' }));

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);

        const storedHash = refreshTokens[user.id];
        const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        if (!user || storedHash !== incomingHash) {
            // If token is invalid or reused (hash doesn't match stored), reject
            return res.writeHead(403).end(JSON.stringify({ error: 'Invalid refresh' }));
        }

        // Rotate token
        delete refreshTokens[user.id];
        saveRefresh();

        const newAccess = signAccess(user);
        const newRefresh = signRefresh(user);

        refreshTokens[user.id] = crypto.createHash('sha256').update(newRefresh).digest('hex');
        saveRefresh();

        addAudit(user.id, 'refresh', req);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accessToken: newAccess, refreshToken: newRefresh }));
    } catch (err) {
        console.error('Refresh error:', err.message);
        res.writeHead(403).end(JSON.stringify({ error: 'Invalid refresh request' }));
    }
}

module.exports = { authenticate, requireRole, refreshTokenHandler };
