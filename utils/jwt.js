const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) console.warn('JWT_SECRET is not defined!');

function signAccess(user) {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
}
function signRefresh(user) {
    return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
}
function verifyAccess(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAccess, signRefresh, verifyAccess };
