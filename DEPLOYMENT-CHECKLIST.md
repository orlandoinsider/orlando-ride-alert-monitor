# ☑️ Deployment Checklist

Use this checklist to ensure everything is set up correctly.

---

## 📋 Before Deployment

### Database
- [ ] I have my PostgreSQL DATABASE_URL ready
- [ ] The database is accessible from external IPs
- [ ] The connection string format is correct: `postgresql://username:password@hostname:5432/database_name`

### SMTP (Gmail)
- [ ] I have a Gmail account
- [ ] 2-Step Verification is enabled
- [ ] I've generated an App Password
- [ ] I've copied the 16-character app password

### GitHub
- [ ] I have a GitHub account
- [ ] I've created a new repository for this service
- [ ] Git is installed on my computer

### Railway
- [ ] I've signed up at railway.app
- [ ] I've connected my GitHub account to Railway

---

## 🚀 During Deployment

### Code Upload
- [ ] I've initialized git in the `ride-alert-monitor` folder
- [ ] I've committed all files
- [ ] I've pushed to my GitHub repository

### Railway Setup
- [ ] I've created a new Railway project
- [ ] I've connected it to my GitHub repo
- [ ] Railway detected it as a Node.js app
- [ ] The build completed successfully

### Environment Variables
- [ ] Added `DATABASE_URL`
- [ ] Added `SMTP_HOST` (smtp.gmail.com)
- [ ] Added `SMTP_PORT` (587)
- [ ] Added `SMTP_USER` (my Gmail address)
- [ ] Added `SMTP_PASS` (my 16-char app password)
- [ ] Added `SMTP_FROM` ("Orlando Insider" <my-email@gmail.com>)

---

## ✅ Post-Deployment

### Verification
- [ ] Service is running (not crashed)
- [ ] Logs show "SMTP connection verified"
- [ ] Logs show "Checking alerts every 2 minutes"
- [ ] No error messages in logs
- [ ] First monitoring cycle completed successfully

### Testing
- [ ] Created a test ride alert on my website
- [ ] Monitoring service detected the alert
- [ ] Notification was sent successfully (check logs)
- [ ] Received SMS notification

### Monitoring
- [ ] Added Railway project to bookmarks
- [ ] Know how to access logs (Logs tab in Railway)
- [ ] Understand the log format
- [ ] Can see heartbeat messages every 10 minutes

---

## 🎉 Success Criteria

Your deployment is successful if:

✅ Railway dashboard shows service is "RUNNING"  
✅ Logs show monitoring cycles every 2 minutes  
✅ Logs show heartbeat every 10 minutes  
✅ No error messages in logs  
✅ Test alert triggered a notification  

---

## 🔄 Maintenance

### Weekly
- [ ] Check Railway logs for any errors
- [ ] Verify service is still running
- [ ] Check that notifications are being sent

### Monthly
- [ ] Review Railway usage (should stay in free tier)
- [ ] Verify SMTP connection is still working
- [ ] Check database connection is healthy

---

## 🆘 Common Issues

**Issue:** Service keeps restarting  
**Solution:** Check logs for error, verify DATABASE_URL

**Issue:** No notifications being sent  
**Solution:** Verify SMTP credentials, check user has SMS email configured

**Issue:** "SMTP connection failed"  
**Solution:** Regenerate Gmail app password, update SMTP_PASS

**Issue:** "Database connection error"  
**Solution:** Whitelist Railway IP, verify DATABASE_URL format

---

**All done?** Your monitoring service is bulletproof! 🎉
