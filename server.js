const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { users, refreshTokens, saveRefresh, addAudit } = require('./utils/db');
const { signAccess, signRefresh } = require('./utils/jwt');
const { authenticate, requireRole, refreshTokenHandler } = require('./utils/auth');
const { logAccess } = require('./utils/logger');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    logAccess(req);
    const parsedUrl = url.parse(req.url, true);
    let body = ''; // Buffer for body

    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        // Basic body parsing
        try {
            if (req.headers['content-type'] === 'application/json') {
                req.body = JSON.parse(body);
            } else {
                req.body = parse(body);
            }
        } catch (e) {
            req.body = {};
        }

        // Helper for JSON response
        res.json = (data, status = 200) => {
            if (!res.headersSent) {
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            }
        };

        // Helper for Middleware Error Handling
        const next = (err) => {
            if (err) res.json({ error: err.message }, err.status || 500);
        };

        // --- ROUTES ---

        // POST /login
        if (req.method === 'POST' && parsedUrl.pathname === '/login') {
            const { email, senha } = req.body;
            // Plain text password comparison as per snippet.
            // In production use bcrypt.compare(senha, u.password)
            const user = users.find(u => u.email === email && u.password === senha);

            if (!user) return res.json({ error: 'Invalid creds' }, 401);

            const access = signAccess(user);
            const refresh = signRefresh(user);
            const hash = crypto.createHash('sha256').update(refresh).digest('hex');

            refreshTokens[user.id] = hash; // Update in memory object
            saveRefresh(); // Persist to file

            addAudit(user.id, 'login', req);
            return res.json({ accessToken: access, refreshToken: refresh });
        }

        // POST /refresh
        if (req.method === 'POST' && parsedUrl.pathname === '/refresh') {
            return refreshTokenHandler(req, res);
        }

        // POST /logout
        if (req.method === 'POST' && parsedUrl.pathname === '/logout') {
            return authenticate(req, (err) => {
                if (err) return next(err);

                if (refreshTokens[req.user.id]) {
                    delete refreshTokens[req.user.id];
                    saveRefresh();
                }
                addAudit(req.user.id, 'logout', req);
                res.json({ message: 'Logged out successfully' });
            });
        }

        // GET/POST /protected
        if (parsedUrl.pathname === '/protected') {
            return authenticate(req, (err) => {
                if (err) return next(err);
                requireRole('admin')(req, (err2) => {
                    if (err2) return next(err2);
                    res.json({
                        message: 'Welcome to protected area',
                        user: req.user,
                        timestamp: new Date().toISOString()
                    });
                });
            });
        }

        // GET /audit
        if (parsedUrl.pathname === '/audit') {
            return authenticate(req, (err) => {
                if (err) return next(err);
                requireRole('admin')(req, (err2) => {
                    if (err2) return next(err2);
                    // Read audit file directly to get latest
                    const auditData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/audit.json'), 'utf8'));
                    res.json(auditData.slice(-100)); // Last 100 entries
                });
            });
        }

        // 404
        if (!res.finished) {
            res.json({ error: 'Route not found' }, 404);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
