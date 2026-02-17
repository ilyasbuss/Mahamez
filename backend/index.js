const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const path = require('path');
dotenv.config();

const app = express();
const db = new Database(path.join(__dirname, 'mahamez.db'));
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Rate Limiting
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 requests
    message: { detail: 'Zu viele Login-Versuche. Bitte versuchen Sie es in 10 Minuten erneut.' }
});

// Database Initialization
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT CHECK(role IN ('planer', 'mitarbeiter')) NOT NULL,
        status TEXT NOT NULL DEFAULT 'invited',
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        invitation_token TEXT,
        invitation_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        known_ips TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        user_id INTEGER,
        email TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Helper for Audit Logs
function logEvent(type, userId, email, req, details = {}) {
    try {
        const stmt = db.prepare('INSERT INTO audit_log (event_type, user_id, email, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(type, userId, email, req.ip, req.headers['user-agent'], JSON.stringify(details));
    } catch (e) {
        console.error("Audit log failed:", e);
    }
}

// Seed Initial Users if empty
const count = db.prepare('SELECT count(*) as count FROM users').get();
if (count.count === 0) {
    const hashedPass = bcrypt.hashSync('Passwort123', 12);

    // Planner
    db.prepare('INSERT INTO users (email, first_name, last_name, hashed_password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run('planer@swr.de', 'Admin', 'User', hashedPass, 'planer', 'active');

    // Employee
    db.prepare('INSERT INTO users (email, first_name, last_name, hashed_password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run('user@swr.de', 'Test', 'Mitarbeiter', hashedPass, 'mitarbeiter', 'active');

    console.log("Database seeded with default users.");
}

// Routes
app.post('/api/auth/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 1000);
        return res.status(423).json({
            detail: `Account gesperrt für ${remaining} Sekunden`,
            locked_until: user.locked_until
        });
    }

    if (!user || !bcrypt.compareSync(password, user.hashed_password)) {
        if (user) {
            const attempts = user.failed_login_attempts + 1;
            let lockedUntil = null;
            if (attempts >= 10) {
                lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
                logEvent('login_locked', user.id, email, req);
            }
            db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?')
                .run(attempts, lockedUntil, user.id);

            logEvent('login_failed', user.id, email, req);
            return res.status(401).json({
                detail: 'Email oder Passwort falsch',
                remaining_attempts: Math.max(0, 10 - attempts)
            });
        }
        return res.status(401).json({ detail: 'Email oder Passwort falsch' });
    }

    // Success
    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);

    const accessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY || 'secret',
        { expiresIn: '1h' }
    );

    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
        .run(user.id, refreshToken, expiresAt);

    logEvent('login_success', user.id, user.email, req);

    res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 3600,
        user: {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
