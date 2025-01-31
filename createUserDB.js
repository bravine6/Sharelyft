const sqlite3 = require('sqlite3').verbose(); // Require SQLite3 library

// Initialize the database
const db = new sqlite3.Database('members.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create a table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      phoneNumber TEXT,
      password TEXT,
      confirmPassword TEXT,
      birthday TEXT,
      gender TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "members" created or already exists.');
    }
  });

  // NEW: Create a Feedback Table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
  if (err) {
    console.error('Error creating contact_messages table:', err.message);
  } else {
    console.log('Table "contact_messages" created or already exists.');
  }
});

// pasword reset table to store the reset token
db.run(`CREATE TABLE IF NOT EXISTS password_reset (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL
)`);


// Close the database connection


