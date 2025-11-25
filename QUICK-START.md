# 🚀 Quick Start Guide

## 5-Minute Railway Deployment

### 1️⃣ Get Your Database URL

From your hosting provider dashboard, copy your PostgreSQL connection string:
```
postgresql://username:password@hostname:5432/database_name
```

### 2️⃣ Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate password for "Mail" > "Other (Orlando Insider)"
5. Copy the 16-character code

### 3️⃣ Push to GitHub

```bash
cd ride-alert-monitor
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/ride-alert-monitor.git
git push -u origin main
```

### 4️⃣ Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** > **"Deploy from GitHub repo"**
3. Select your `ride-alert-monitor` repo
4. Railway auto-detects and deploys!

### 5️⃣ Add Environment Variables

In Railway dashboard > **Variables** tab:

```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop  # Your 16-char app password
SMTP_FROM="Orlando Insider" <yourname@gmail.com>
```

### 6️⃣ Verify It's Running

Go to **Logs** tab in Railway. You should see:

```
🚀 Orlando Insider - Ride Alert Monitoring Service
📊 Checking alerts every 2 minutes
🔧 Testing SMTP connection...
✅ SMTP connection verified

🎢 Ride Alert Monitor - 2:30 PM (Orlando Time)
✅ Monitoring cycle complete
```

---

## ✅ Done!

Your monitoring service is now:
- ✅ Running 24/7
- ✅ Checking every 2 minutes
- ✅ Completely independent
- ✅ Auto-restarting on errors

---

## 🔍 Troubleshooting

**Can't connect to database?**
- Check DATABASE_URL is correct
- Whitelist Railway's IP in your database firewall

**SMTP errors?**
- Verify you're using Gmail App Password (not regular password)
- Check SMTP_USER and SMTP_PASS are correct

**Service keeps restarting?**
- Check Railway logs for error messages
- Verify all environment variables are set

---

**Need help?** Check the full [README.md](README.md) for detailed instructions.
