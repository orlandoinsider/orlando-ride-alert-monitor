# 🚀 Deploy in 3 Commands (Easiest Method!)

I've installed Railway CLI for you. Here's all you need to do:

## Step 1: Login to Railway

Open a terminal and run:
```bash
railway login
```

This will open a browser window. Click "Authorize" to connect Railway CLI.

## Step 2: Link to a New Project

```bash
cd /home/ubuntu/ride-alert-monitor
railway init
```

Choose:
- "Create new project"
- Name it: "Ride Alert Monitor"

## Step 3: Deploy!

```bash
railway up
```

That's it! Railway will:
1. Upload your code
2. Install dependencies
3. Start the monitoring service
4. Keep it running 24/7

## Step 4: Add Environment Variables

The .env file is already configured, but Railway needs them as environment variables:

```bash
railway variables
```

Or go to your Railway dashboard → Variables tab and verify these are set:
- `DATABASE_URL`
- `SMTP_HOST`
- `SMTP_PORT` 
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

(They should auto-upload from your .env file)

## Check It's Working

```bash
railway logs
```

You should see:
```
✅ Starting ride alert monitoring service...
✅ Connected to database  
✅ Checking ride alerts every 2 minutes
```

## That's It!

Your monitoring service is now running 24/7 on Railway. 

No GitHub, no complicated setup - just 3 commands! 🎉

## Need Help?

If any command doesn't work, just let me know and I'll guide you through it!
