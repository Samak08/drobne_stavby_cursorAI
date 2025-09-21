const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database setup
const db = new sqlite3.Database('database.sqlite');

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text_field TEXT NOT NULL,
        checkbox_value BOOLEAN NOT NULL,
        select_value TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        // Get user's orders
        db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId], (err, orders) => {
            if (err) {
                console.error(err);
                res.status(500).send('Database error');
                return;
            }
            res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
        });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
    }
});

app.get('/form', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/');
        return;
    }
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.get('/api/orders', (req, res) => {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId], (err, orders) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(orders);
    });
});

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
               [username, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            
            req.session.userId = this.lastID;
            res.json({ success: true, message: 'Registration successful' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        try {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                req.session.userId = user.id;
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.post('/api/submit-form', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { textField, checkboxValue, selectValue, phoneNumber, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!textField || !selectValue || !phoneNumber) {
        return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Phone number validation (basic format check)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    db.run('INSERT INTO orders (user_id, text_field, checkbox_value, select_value, phone_number, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
           [req.session.userId, textField, checkboxValue === 'true', selectValue, phoneNumber, latitude, longitude],
           function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true, orderId: this.lastID, message: 'Form submitted successfully' });
    });
});

app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(user);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
