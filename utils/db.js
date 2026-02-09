const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const REFRESH_FILE = path.join(__dirname, '../data/refresh.json');
const AUDIT_FILE = path.join(__dirname, '../data/audit.json');

// Ensure files exist
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(REFRESH_FILE)) fs.writeFileSync(REFRESH_FILE, '{}');
if (!fs.existsSync(AUDIT_FILE)) fs.writeFileSync(AUDIT_FILE, '[]');

let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
let refreshTokens = JSON.parse(fs.readFileSync(REFRESH_FILE, 'utf8') || '{}');
let audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8') || '[]');

function saveRefresh() { fs.writeFileSync(REFRESH_FILE, JSON.stringify(refreshTokens)); }
function addAudit(userId, action, req) {
  audit.push({ timestamp: new Date().toISOString(), userId, action, ip: req.socket.remoteAddress });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(audit.slice(-1000))); // Limita tamanho
}

module.exports = { users, refreshTokens, saveRefresh, addAudit };
