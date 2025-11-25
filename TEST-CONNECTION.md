# 🧪 Test Your Configuration Locally

Before deploying to Railway, you can test your configuration locally to ensure everything works.

---

## Prerequisites

1. Node.js installed (v18+)
2. Your database accessible from your computer
3. Gmail app password ready

---

## Steps

### 1. Install Dependencies

```bash
cd ride-alert-monitor
npm install
npx prisma generate
```

### 2. Create .env File

Create a file named `.env` in the root directory:

```bash
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="yourname@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="\"Orlando Insider\" <yourname@gmail.com>"
```

### 3. Build the Project

```bash
npm run build
```

If this succeeds, your TypeScript code is valid ✅

### 4. Test Database Connection

```bash
# This will try to connect and run a simple query
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Database connected!'); prisma.\$disconnect(); }).catch(e => { console.error('❌ Database error:', e.message); });"
```

### 5. Test SMTP Connection

Create a test file `test-smtp.js`:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('✅ SMTP connection verified!'))
  .catch(e => console.error('❌ SMTP error:', e.message));
```

Run it:
```bash
node test-smtp.js
```

### 6. Run Locally (Optional)

**Warning:** This will actually check alerts and send notifications!

```bash
npm start
```

Press `Ctrl+C` to stop.

---

## Expected Output

If everything is configured correctly, you should see:

```
🚀 Orlando Insider - Ride Alert Monitoring Service
📊 Checking alerts every 2 minutes
⏰ Process will run continuously
🆔 Process ID: 12345

🔧 Testing SMTP connection...
✅ SMTP connection verified

═══════════════════════════════════════════════════════
🎢 Ride Alert Monitor - 2:30:15 PM (Orlando Time)
═══════════════════════════════════════════════════════

🔔 Checking Wait Time Alerts...
   Found 0 active wait time alert(s)

🔓 Checking Ride Reopen Alerts...
   Found 0 active reopen alert(s)

✅ Monitoring cycle complete

🏥 Health: 0 errors, last success 0 min ago
```

---

## Troubleshooting

**"Cannot find module '@prisma/client'"**
- Run: `npx prisma generate`

**"Database connection error"**
- Check DATABASE_URL is correct
- Ensure database is accessible from your computer
- Try adding `?sslmode=require` to the connection string

**"SMTP connection failed"**
- Verify SMTP_PASS is the app password (not regular password)
- Check SMTP_USER is your full Gmail address
- Ensure 2-Step Verification is enabled

---

**All tests pass?** You're ready to deploy to Railway! 🚀
