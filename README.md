# 🚗 ShareLyft - Ride Sharing Platform

**ShareLyft** is a web-based ride-sharing platform where users can **find rides, offer rides, and connect with other travelers.** It includes secure authentication, a user-friendly interface, and robust backend functionalities.

## 🔥 Features
✅ **User Registration & Login** (Secure with bcrypt)  
✅ **Find and Offer Rides**  
✅ **Forgot & Reset Password Handling**  
✅ **Beautiful UI with Bootstrap**  
✅ **SQLite (Local) & PostgreSQL (Heroku)**  
✅ **Deployed on Heroku**  
✅ **Continuous Integration/Continuous Deployment**  

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
```

### **2️⃣ Install Dependencies**
```bash
npm ci
```

### **3️⃣ Start the Server**
```bash
npm start
```

### **4️⃣ Build for Production**
```bash
npm run build
```

### **⚙ Environment Variables**
Create a `.env` file and add:
```
PORT=3000
DB_NAME=members.db
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
DOMAIN=https://sharelyft.com
```

## 🛠 Tech Stack
- **Frontend**: HTML, CSS, Bootstrap, EJS
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Local), PostgreSQL (Heroku)
- **Authentication**: bcrypt.js, Sessions
- **Deployment**: Heroku, GitHub
- **CI/CD**: Jenkins

## 📦 CI/CD Pipeline

This project uses Jenkins for continuous integration and delivery. The pipeline is defined in `task7.3HD.groovy`.

### Pipeline Setup

Before running the pipeline, ensure you have:

1. Set up required credentials in Jenkins (see `JENKINS_CREDENTIALS_SETUP.md`)
2. Installed required Jenkins plugins:
   - NodeJS Plugin
   - Docker Pipeline
   - SonarQube Scanner
   - AWS Steps
   - Slack Notification

### Pipeline Stages

The CI/CD pipeline includes the following stages:

1. **Build** - Builds the application and creates Docker image
2. **Test** - Runs unit, integration, and E2E tests
3. **Code Quality** - Performs code quality analysis with SonarQube
4. **Security** - Checks dependencies for vulnerabilities
5. **Deploy** - Deploys to testing environment
6. **Approval** - Manual approval gate for production deployment
7. **Release** - Deploys to production environment
8. **Monitoring** - Sets up monitoring for the production application

## 🎯 How to Contribute
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make changes and commit (`git commit -m "Add new feature"`)
4. Push to GitHub (`git push origin feature-branch`)
5. Open a Pull Request

## 🔐 Security & Encryption
- Passwords are hashed using bcrypt.js (Blowfish encryption)
- Sessions are securely managed with Express sessions
- Sensitive credentials are stored in environment variables
- Dependency vulnerability scanning in CI pipeline

## 📩 Contact
👤 **Bravine Cheruiyot**
📧 Email: ropbravine@gmail.com or sharelyft.info@gmail.com
🌍 GitHub: bravine6

## ⭐ Support the Project
If you like ShareLyft, consider giving it a star ⭐ on GitHub!