# 🚗 ShareLyft - Ride Sharing Platform

**ShareLyft** is a web-based ride-sharing platform where users can **find rides, offer rides, and connect with other travelers.** It includes secure authentication, a user-friendly interface, and robust backend functionalities.

## 🔥 Features
✅ **User Registration & Login** (Secure with bcrypt)  
✅ **Find and Offer Rides**  
✅ **Forgot & Reset Password Handling**  
✅ **Beautiful UI with Bootstrap**  
✅ **SQLite (Local) & PostgreSQL (Heroku)**  
✅ **Deployed on Heroku**  

---

## 🚀 **Live Demo**
🌍 **Heroku Link**: [https://sharelyft-ec278c455e03.herokuapp.com/login](https://sharelyft-ec278c455e03.herokuapp.com/login)

---

## 📌 **Installation Guide**
To run the project locally, follow these steps:

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/bravine6/ShareLyft.git
cd ShareLyft

2️⃣ Install Dependencies
npm install

3️⃣ Start the Server
npm start

⚙ Environment Variables
Create a .env file and add:
PORT=3000
DB_NAME=members.db
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
DOMAIN=https://sharelyft.com

🛠 Tech Stack
Frontend: HTML, CSS, Bootstrap, EJS
Backend: Node.js, Express.js
Database: SQLite (Local), PostgreSQL (Heroku)
Authentication: bcrypt.js, Sessions
Deployment: Heroku, GitHub

🎯 How to Contribute
Fork the repository
Create a new branch (git checkout -b feature-branch)
Make changes and commit (git commit -m "Add new feature")
Push to GitHub (git push origin feature-branch)
Open a Pull Request

🔐 Security & Encryption
Passwords are hashed using bcrypt.js (Blowfish encryption)
Sessions are securely managed with Express sessions
Sensitive credentials are stored in environment variables

📩 Contact
👤 Bravine Cheruiyot
📧 Email: ropbravine@gmail.com or sharelyft.info@gmail.com
🌍 GitHub: bravine6

⭐ Support the Project
If you like ShareLyft, consider giving it a star ⭐ on GitHub!