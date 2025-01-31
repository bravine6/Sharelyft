// Require the express web application framework (https://expressjs.com)
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt'); // For password hashing

const crypto = require('crypto'); // For generating password reset token
const nodemailer = require('nodemailer'); // For sending emails

// Create a new web application by calling the express function
const app = express();
const port = 3000;
const saltRounds = 10; // For password hashing

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public_html'));

// Seting up session middleware
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Connect to the SQLite database
const db = new sqlite3.Database('members.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database.');  
  }
});

// Middleware to check authentication for protected routes
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// GET Routes
const pages = ['login', 'register', 'find_ride', 'offer_ride', 'about_us', 'contact_us'];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.render(page, {
      title: `${page.replace('_', ' ').toUpperCase()} - Sharelyft`,
      cssFile: `${page}.css`,
      jsFile: `${page}.js`,
      user: req.session.user || null,
      activePage: page
    });
  });
});

// GET request for the root, which will render the login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// POST request to handle user registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, confirmPassword, birthday, gender } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password || !birthday || !gender) {
    return res.status(400).send('All fields are required.');
  }
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO members (firstName, lastName, email, phoneNumber, password, birthday, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [firstName, lastName, email, phoneNumber, hashedPassword, birthday, gender], function (err) {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Error saving user data.');
      }

      console.log(`User registered: ${firstName} (ID: ${this.lastID})`);
      res.redirect('/login');
    });

  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Server error during registration.');
  }
});

// POST request to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  const query = `SELECT * FROM members WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error processing your request.');
    }

    if (!user) {
      return res.status(401).send('Invalid email or password.');
    }

    try {
      // Compare the entered password with the hashed password in the database
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).send('Invalid email or password.');
      }

      // Store user session
      req.session.userId = user.id;
      req.session.user = user;

      console.log(`✅ User logged in:`, user);
      res.redirect('/userProfile');

    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).send('Server error during login.');
    }
  });
});

// GET User Profile (Protected Route)
app.get('/userProfile', isAuthenticated, (req, res) => {
  const query = `SELECT * FROM members WHERE id = ?`;
  db.get(query, [req.session.userId], (err, user) => {
    if (err || !user) {
      console.error('Error fetching user data:', err);
      req.session.destroy();
      return res.redirect('/login');
    }

    res.render('profile', { 
      title: 'User Profile - Sharelyft', 
      cssFile: 'profile.css', 
      jsFile: 'profile.js', 
      user, 
      activePage: 'profile' 
    });
  });
});

// POST request to update user profile data
app.post('/updateUserData', isAuthenticated, (req, res) => {
  const { firstName, lastName, phoneNumber, birthday, gender } = req.body;
  const query = `UPDATE members SET firstName = ?, lastName = ?, phoneNumber = ?, birthday = ?, gender = ? WHERE id = ?`;

  db.run(query, [firstName, lastName, phoneNumber, birthday, gender, req.session.userId], function (err) {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).send('Error updating profile.');
    }

    req.session.user = { ...req.session.user, firstName, lastName, phoneNumber, birthday, gender };
    res.redirect('/userProfile');
  });
});

// POST request to handle feedback messages
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required.");
  }

  const query = `INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`;

  db.run(query, [name, email, message], function (err) {
    if (err) {
      console.error("Error saving contact message:", err);
      return res.status(500).send("Error saving your message.");
    }

    console.log(`✅ Contact message from ${name} saved.`);
    res.redirect('/contact_us');
  });
});

// GET request to render contact messages page (Protected)
app.get('/contactMessages', isAuthenticated, (req, res) => {
  const query = `SELECT * FROM contact_messages ORDER BY createdAt DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).send("Error retrieving messages.");
    }

    res.render('contact_messages', { 
      messages: rows, 
      title: 'Contact Messages - Sharelyft', 
      cssFile: 'contact_messages.css',
      jsFile: 'messages.js', 
      user: req.session.user, 
      activePage: 'contactMessages' 
    });
  });
});

// POST request to handle password reset
app.get('/forgot_password', (req, res) => {
    res.render('forgot_password', { 
      title: 'Forgot Password - ShareLyft',
      cssFile: 'forgot_password.css',
      jsFile: null,
      activePage: 'forgot_password',
      user: req.session.user || null
    });
});

// POST request to handle password reset
app.post('/forgot_password', (req, res) => {
  const { email } = req.body;

  db.get(`SELECT * FROM members WHERE email = ?`, [email], (err, user) => {
      if (err) {
          console.error("❌ Database Error:", err);
          return res.status(500).send("Database error while checking user.");
      }

      if (!user) {
          return res.status(400).send("User with this email does not exist.");
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expires_at = new Date(Date.now() + 3600000).toISOString(); // 1-hour expiry

      // Store token in password_reset table
      db.run(`INSERT INTO password_reset (email, token, expires_at) VALUES (?, ?, ?)`, 
          [email, token, expires_at], function (err) {
              if (err) {
                  console.error("❌ Database Insert Error:", err);
                  return res.status(500).send("Error generating reset link.");
              }

              console.log("✅ Reset token stored:", { email, token, expires_at });

              // Send reset email
              const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  secure: false,
                  auth: {
                      user: "ropbravine@gmail.com",
                      pass: "wnku zfwj bnxp qyap"
                  }
              });

              const resetLink = `http://localhost:3000/reset_password?token=${token}`;
              const mailOptions = {
                  from: '"ShareLyft Support" <ropbravine@gmail.com>',
                  to: email,
                  subject: 'Password Reset Request',
                  text: `Click the link to reset your password: ${resetLink}`
              };

              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.error("❌ Email Sending Error:", error);
                      return res.status(500).send("Error sending email.");
                  }
                  console.log("✅ Email Sent Successfully:", info.response);
                  res.send("Reset password link sent to your email.");
              });
      });
  });
});


// GET request to render password reset form
app.get('/reset_password', (req, res) => {
  const { token } = req.query;

  if (!token) {
      console.error("❌ No token provided.");
      return res.status(400).send("Invalid reset link.");
  }

  db.get(`SELECT * FROM password_reset WHERE token = ? AND expires_at > ?`, [token, new Date().toISOString()], (err, row) => {
      if (err) {
          console.error("❌ Database Error:", err);
          return res.status(500).send("Database error while validating token.");
      }

      if (!row) {
          console.error("❌ Token not found or expired.");
          return res.status(400).send("Invalid or expired reset token.");
      }

      console.log("✅ Valid token found:", row);
      res.render('reset_password', { 
          title: 'Reset Password', 
          token, 
          cssFile: 'reset_password.css', 
          jsFile: null, 
          activePage: 'reset_password', 
          user: req.session.user || null 
      });
  });
});


app.post('/reset_password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
  }

  db.get(`SELECT * FROM password_reset WHERE token = ? AND expires_at > datetime('now')`, [token], async (err, row) => {
      if (!row) return res.status(400).send("Invalid or expired reset token.");

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password
      db.run(`UPDATE members SET password = ? WHERE email = ?`, [hashedPassword, row.email], (err) => {
          if (err) return res.status(500).send("Error updating password.");

          // Delete the reset token
          db.run(`DELETE FROM password_reset WHERE token = ?`, [token]);

          res.send("Password successfully updated! You can now <a href='/login'>Login</a>.");
      });
  });
});



// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
});
