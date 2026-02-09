const { addAudit } = require('./db');
// No fs needed here as addAudit handles logic

function logAccess(req) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.socket.remoteAddress}`);
}

module.exports = { logAccess, addAudit };
