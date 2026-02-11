const express = require('express');
const cors = require('cors');
const db = require('./database.cjs');

const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all users (Admin only in real app, but simple here)
app.get('/api/users', (req, res) => {
  const sql = "SELECT * FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    const users = {};
    rows.forEach(row => {
      users[row.id] = row;
    });
    res.json(users);
  });
});

// Get single user
app.get('/api/users/:id', (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json(row || null);
  });
});

// Create/Register User OR Login
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const sql = "SELECT * FROM users WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (row) {
      if (row.password === password) {
        res.json(row);
      } else {
        res.status(401).json({ "error": "Invalid password" });
      }
    } else {
      // User doesn't exist, auto-register
      const newUser = {
        id,
        password,
        role: 'user',
        credit: 0,
        totalBet: 0,
        totalWin: 0
      };
      const insert = 'INSERT INTO users (id, password, role, credit, totalBet, totalWin) VALUES (?,?,?,?,?,?)';
      db.run(insert, Object.values(newUser), function (err) {
        if (err) {
          res.status(400).json({ "error": err.message });
          return;
        }
        res.json(newUser);
      });
    }
  });
});

// Explicit Register (Admin use)
app.post('/api/users', (req, res) => {
  const { id, password, role = 'user' } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: "ID and Password required" });
  }

  const check = "SELECT id FROM users WHERE id = ?";
  db.get(check, [id], (err, row) => {
    if (row) return res.status(400).json({ error: "User already exists" });

    const newUser = {
      id,
      password,
      role,
      credit: 0,
      totalBet: 0,
      totalWin: 0
    };
    const insert = 'INSERT INTO users (id, password, role, credit, totalBet, totalWin) VALUES (?,?,?,?,?,?)';
    db.run(insert, Object.values(newUser), function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json(newUser);
    });
  });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === 'OCEAN_MASTER') {
    return res.status(401).json({ error: "Cannot delete the Ocean Master" });
  }

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Diver purged from the abyss", id });
  });
});

// Update User (Credit, Stats)
app.patch('/api/users/:id', (req, res) => {
  const { credit, totalBet, totalWin } = req.body;
  const id = req.params.id;

  let sql = `UPDATE users SET `;
  const params = [];
  const updates = [];

  if (credit !== undefined) { updates.push('credit = ?'); params.push(credit); }
  if (totalBet !== undefined) { updates.push('totalBet = ?'); params.push(totalBet); }
  if (totalWin !== undefined) { updates.push('totalWin = ?'); params.push(totalWin); }

  if (updates.length === 0) {
    res.json({ message: "No changes" });
    return;
  }

  sql += updates.join(', ') + " WHERE id = ?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    // Return updated user
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      res.json(row || null);
    });
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} at 0.0.0.0`);
});
