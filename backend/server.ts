import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;
const dbPath = join(__dirname, 'mahamez.db');

// Middleware
app.use(cors());
app.use(express.json());

// Database Initialization
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('planer', 'mitarbeiter')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    systemRole TEXT DEFAULT 'EMPLOYEE',
    contractRole TEXT,
    departments TEXT, -- JSON string
    skillAssignments TEXT, -- JSON string
    maxHoursPerWeek INTEGER DEFAULT 40,
    contractHours INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    employeeId TEXT,
    date TEXT NOT NULL,
    typeId TEXT NOT NULL,
    roleName TEXT NOT NULL,
    customName TEXT,
    isPublished INTEGER DEFAULT 0,
    FOREIGN KEY (employeeId) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    planIds TEXT -- JSON string
  );
`);

// Mock Initial User if database is empty
const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('Passwort123', salt);

    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
        'planer@swr.de', hashedPassword, 'Planer Admin', 'planer'
    );
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
        'user@swr.de', hashedPassword, 'Mitarbeiter User', 'mitarbeiter'
    );
}

// Auth Routes
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

        if (!user) {
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }

        // Handle both "password" and "hashed_password" column names for backward compatibility
        const hash = user.hashed_password || user.password;

        if (!hash || !bcrypt.compareSync(password, hash)) {
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.SECRET_KEY || 'default_secret',
            { expiresIn: '24h' }
        );

        // Handle both "name" and "first_name/last_name"
        const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: displayName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Fehler' });
    }
});

// Employees API
app.get('/api/employees', (req, res) => {
    try {
        const employees = db.prepare('SELECT * FROM employees').all();
        res.json(employees.map((e: any) => ({
            ...e,
            departments: JSON.parse(e.departments || '[]'),
            skillAssignments: JSON.parse(e.skillAssignments || '[]')
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees' });
    }
});

app.post('/api/employees', (req, res) => {
    const emp = req.body;
    try {
        db.prepare(`
            INSERT OR REPLACE INTO employees 
            (id, name, email, systemRole, contractRole, departments, skillAssignments, maxHoursPerWeek, contractHours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            emp.id, emp.name, emp.email, emp.systemRole, emp.contractRole,
            JSON.stringify(emp.departments), JSON.stringify(emp.skillAssignments),
            emp.maxHoursPerWeek, emp.contractHours
        );
        res.status(201).json(emp);
    } catch (error) {
        res.status(500).json({ message: 'Error saving employee' });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee' });
    }
});

// Shifts API
app.get('/api/shifts', (req, res) => {
    try {
        const shifts = db.prepare('SELECT * FROM shifts').all();
        res.json(shifts.map((s: any) => ({
            ...s,
            isPublished: !!s.isPublished
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shifts' });
    }
});

app.post('/api/shifts', (req, res) => {
    const shift = req.body;
    try {
        db.prepare(`
            INSERT OR REPLACE INTO shifts 
            (id, employeeId, date, typeId, roleName, customName, isPublished)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            shift.id, shift.id, shift.date, shift.typeId, shift.roleName, shift.customName,
            shift.isPublished ? 1 : 0
        );
        res.status(201).json(shift);
    } catch (error) {
        res.status(500).json({ message: 'Error saving shift' });
    }
});

app.delete('/api/shifts/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM shifts WHERE id = ?').run(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting shift' });
    }
});

// Events API
app.get('/api/events', (req, res) => {
    try {
        const events = db.prepare('SELECT * FROM events').all();
        res.json(events.map((e: any) => ({
            ...e,
            planIds: JSON.parse(e.planIds || '[]')
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

app.post('/api/events', (req, res) => {
    const event = req.body;
    try {
        db.prepare(`
            INSERT OR REPLACE INTO events (id, name, startDate, endDate, planIds)
            VALUES (?, ?, ?, ?, ?)
        `).run(event.id, event.name, event.startDate, event.endDate, JSON.stringify(event.planIds));
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error saving event' });
    }
});

app.delete('/api/events/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Healthy check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

app.listen(port, () => {
    console.log(`[BACKEND] Server is running on port ${port}`);
});
