# Orlando Insider - Ride Alert Monitoring Service

🎢 **Standalone ride alert monitoring service for plan.orlandoinsider.co.uk**

This service monitors ride wait times every 2 minutes and sends notifications when conditions are met.

---

## 🏭 Architecture

```
┌─────────────────────────────────────┐
│  Your Website                       │
│  (plan.orlandoinsider.co.uk)       │
│  ────────────────────────────      │
│  • Users create/edit ride alerts   │
│  • Alerts saved to database        │
│  • All UI/pages/features           │
└───────────────┬──────────────────────┘
               │
               │ (Postgres)
               │
┌──────────────┴──────────────────────┐
│  Monitoring Service (Railway)       │
│  ────────────────────────────      │
│  • Connects to your database        │
│  • Checks every 2 minutes            │
│  • Sends email/SMS notifications     │
└─────────────────────────────────────┘
```

---

## ✨ Features

✅ **24/7 Monitoring** - Checks every 2 minutes  
✅ **Wait Time Alerts** - Notifies when wait times drop below threshold  
✅ **Ride Reopen Alerts** - Notifies when closed rides reopen  
✅ **Auto-Cancellation** - All alerts cancelled at 11:59 PM Orlando time  
✅ **4-Hour Throttling** - Prevents notification spam  
✅ **Self-Healing** - Auto-restarts on errors  

---

## 🚀 Deployment to Railway.app

### Prerequisites

1. **Railway Account** (free tier)
   - Sign up at [railway.app](https://railway.app)

2. **Database URL** from your hosting provider
   - Format: `postgresql://username:password@hostname:5432/database_name`

3. **Gmail Account** for SMTP (recommended)
   - You'll need an [App Password](https://support.google.com/accounts/answer/185833)

---

### Step 1: Prepare Your Files

1. **Download this monitoring service** (the `ride-alert-monitor` folder)

2. **Create a GitHub repository:**
   ```bash
   cd ride-alert-monitor
   git init
   git add .
   git commit -m "Initial commit: Ride alert monitoring service"
   ```

3. **Push to GitHub:**
   ```bash
   # Create a new repo on GitHub first, then:
   git remote add origin https://github.com/YOUR-USERNAME/ride-alert-monitor.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign in

2. **Click "New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Select your `ride-alert-monitor` repository**

5. **Railway will automatically detect the Node.js app**

---

### Step 3: Configure Environment Variables

In the Railway dashboard, go to **Variables** tab and add:

#### Database Configuration
```
DATABASE_URL
```
Value: Your PostgreSQL connection string
```
postgresql://username:password@hostname:5432/database_name
```

#### SMTP Configuration (Gmail)
```
SMTP_HOST
```
Value: `smtp.gmail.com`

```
SMTP_PORT
```
Value: `587`

```
SMTP_USER
```
Value: Your Gmail address (e.g., `yourname@gmail.com`)

```
SMTP_PASS
```
Value: Your Gmail [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)

```
SMTP_FROM
```
Value: `"Orlando Insider" <yourname@gmail.com>`

---

### Step 4: Deploy & Verify

1. **Railway will automatically build and deploy** your service

2. **Check the logs:**
   - Click on your deployment
   - Go to the "Logs" tab
   - You should see:
     ```
     🚀 Orlando Insider - Ride Alert Monitoring Service
     📊 Checking alerts every 2 minutes
     ⏰ Process will run continuously
     🆔 Process ID: 1

     🔧 Testing SMTP connection...
     ✅ SMTP connection verified
     ```

3. **Service is now running 24/7!**

---

## 🔧 How to Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)"
5. Enter "Orlando Insider" as the name
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
8. Use this as your `SMTP_PASS` value (remove spaces: `abcdefghijklmnop`)

---

## 📊 Monitoring the Service

### View Logs

In Railway:
1. Go to your project
2. Click on the deployment
3. Click "Logs" tab

You'll see:
- 🔔 Alert checks every 2 minutes
- 💓 Heartbeat every 10 minutes
- ✅ Successful notifications
- 🏥 Health status

### Example Log Output
```
═══════════════════════════════════════════════════════
🎢 Ride Alert Monitor - 2:30:15 PM (Orlando Time)
═══════════════════════════════════════════════════════

🔔 Checking Wait Time Alerts...
   Found 3 active wait time alert(s)
   🔍 Space Mountain @ magic-kingdom (target: ≤30 min)
      Current: 25 min (OPEN)
      ✅ THRESHOLD MET! Sending notification...
      📬 SMS sent to 447868743307@sms.clicksend.com

🔓 Checking Ride Reopen Alerts...
   Found 2 active reopen alert(s)
   🔍 Tower of Terror @ hollywood-studios
      Status: CLOSED 🔕
      ⏳ Still closed, monitoring...

✅ Monitoring cycle complete

🏥 Health: 0 errors, last success 0 min ago
```

---

## ⚙️ Configuration

### Check Interval

Default: **2 minutes**

To change, edit `src/index.ts`:
```typescript
}, 2 * 60 * 1000); // Change '2' to your desired minutes
```

### Notification Throttling

Default: **4 hours** between notifications

To change, edit `src/index.ts`:
```typescript
const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
// Change '4' to your desired hours
```

---

## ❓ Troubleshooting

### Service won't start

✅ **Check DATABASE_URL** - Make sure it's correct  
✅ **Check SMTP credentials** - Verify Gmail app password  
✅ **Check Railway logs** - Look for error messages  

### Notifications not sending

✅ **Verify SMTP connection** - Check logs for "SMTP connection verified"  
✅ **Check user SMS email** - Users must have `smsEmail` configured  
✅ **Check throttling** - Wait 4 hours between notifications  

### Database connection errors

✅ **Whitelist Railway IP** - Add Railway's IPs to your database firewall  
✅ **Check SSL mode** - Some databases require `?sslmode=require` in connection string  

---

## 💰 Cost

**Railway.app Free Tier:**
- ✅ $5 free credits per month
- ✅ Enough for 24/7 monitoring
- ✅ No credit card required initially

This monitoring service uses minimal resources and should stay within free tier limits.

---

## 🔄 Updates

To update the monitoring service:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update monitoring service"
   git push
   ```
3. Railway will automatically redeploy

---

## 🎉 Success!

Once deployed:

✅ Your website stays exactly where it is  
✅ Monitoring service runs 24/7 on Railway  
✅ Users get notifications every 2 minutes  
✅ No manual intervention needed  
✅ Completely bulletproof!  

---

## 📞 Support

If you have questions:
1. Check the Railway logs first
2. Verify all environment variables are set
3. Test SMTP connection manually

---

**Built for plan.orlandoinsider.co.uk** 🎰
