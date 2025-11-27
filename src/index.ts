#!/usr/bin/env node

/**
 * Orlando Insider - Ride Alert Monitoring Service
 * Standalone service for monitoring ride wait times and sending notifications
 * 
 * This service runs independently and connects to your existing database
 * to check ride alerts every 2 minutes.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendRideAlertEmail, sendRideReopenEmail, testEmailConnection } from './email';
import { QUEUE_TIMES_PARK_IDS, PARK_NAMES, RideWaitTime } from './constants';
import http from 'http';

// Health check server for Railway
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ride Alert Monitor: OK\n');
});
server.listen(PORT, () => {
  console.log(`✅ Health check server running on port ${PORT}`);
});

const prisma = new PrismaClient();

// Health tracking
let lastSuccessfulCheck = new Date();
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;

/**
 * Fetch real-time wait times for a specific park from queue-times.com
 */
async function fetchRealTimeWaits(parkId: string): Promise<RideWaitTime[]> {
  try {
    const queueTimesParkId = QUEUE_TIMES_PARK_IDS[parkId];
    if (!queueTimesParkId) {
      console.error(`❌ No Queue Times mapping for park: ${parkId}`);
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      `https://queue-times.com/en-US/parks/${queueTimesParkId}/queue_times.json`,
      {
        headers: {
          'User-Agent': 'Orlando Insider Trip Planner (martin@rocktheboat.travel)',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`❌ Failed to fetch wait times for ${parkId}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // Parse the response structure
    const rides: RideWaitTime[] = [];
    if (data.lands && Array.isArray(data.lands)) {
      for (const land of data.lands) {
        if (land.rides && Array.isArray(land.rides)) {
          for (const ride of land.rides) {
            rides.push({
              id: ride.id,
              name: ride.name,
              waitTime: ride.wait_time,
              isOpen: ride.is_open,
            });
          }
        }
      }
    }

    return rides;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`❌ Timeout fetching wait times for ${parkId}`);
    } else {
      console.error(`❌ Error fetching wait times for ${parkId}:`, error.message);
    }
    return [];
  }
}

/**
 * Monitor and notify for wait time alerts
 */
async function monitorWaitTimeAlerts() {
  console.log('\n🔔 Checking Wait Time Alerts...');
  
  try {
    const alerts = await prisma.rideAlert.findMany({
      where: { isActive: true },
      include: {
        accessToken: true,
      },
    });

    console.log(`   Found ${alerts.length} active wait time alert(s)`);

    for (const alert of alerts) {
      try {
        console.log(`   🔍 ${alert.rideName} @ ${alert.parkId} (target: ≤${alert.maxWaitTime} min)`);
        
        // Fetch current wait times for this park
        const rides = await fetchRealTimeWaits(alert.parkId);
        const ride = rides.find((r) => String(r.id) === String(alert.rideId));

        if (!ride) {
          console.log(`      ⚠️  Ride not found in current data`);
          continue;
        }

        console.log(`      Current: ${ride.waitTime} min (${ride.isOpen ? 'OPEN' : 'CLOSED'})`);

        // Check if ride meets threshold
        const meetsThreshold =
          ride.isOpen &&
          ride.waitTime !== null &&
          ride.waitTime >= 5 && // Minimum 5 minutes
          ride.waitTime <= alert.maxWaitTime;

        if (!meetsThreshold) {
          console.log(`      ⏳ Not within target range`);
          continue;
        }

        // Check if user has SMS email configured
        if (!alert.accessToken.smsEmail) {
          console.log(`      ⚠️  No SMS email configured for user`);
          continue;
        }

        console.log(`      ✅ THRESHOLD MET! Sending notification...`);

        // Get park name
        const parkName = PARK_NAMES[alert.parkId] || alert.parkId;

        // Send notification
        try {
          await sendRideAlertEmail({
            rideName: alert.rideName,
            parkName,
            currentWaitTime: ride.waitTime!,
            targetWaitTime: alert.maxWaitTime,
            email: alert.accessToken.email || '',
            smsEmail: alert.accessToken.smsEmail || undefined,
            userName: alert.accessToken.userName,
          });

          // Deactivate alert after notification (no throttling - one alert, one notification)
          await prisma.rideAlert.update({
            where: { id: alert.id },
            data: { 
              lastNotified: new Date(),
              isActive: false, // Deactivate after sending
            },
          });
        } catch (emailError: any) {
          console.log(`      ❌ Failed to send notification:`, emailError.message);
        }
      } catch (error: any) {
        console.error(`      ❌ Error processing alert ${alert.id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error(`❌ Error in monitorWaitTimeAlerts:`, error.message);
    throw error;
  }
}

/**
 * Monitor and notify for ride reopen alerts
 */
async function monitorReopenAlerts() {
  console.log('\n🔓 Checking Ride Reopen Alerts...');
  
  try {
    const alerts = await prisma.rideReopenAlert.findMany({
      where: { isActive: true },
      include: {
        accessToken: true,
      },
    });

    console.log(`   Found ${alerts.length} active reopen alert(s)`);

    for (const alert of alerts) {
      try {
        console.log(`   🔍 ${alert.rideName} @ ${alert.parkId}`);
        
        // Fetch current wait times for this park
        const rides = await fetchRealTimeWaits(alert.parkId);
        const ride = rides.find((r) => String(r.id) === String(alert.rideId));

        if (!ride) {
          console.log(`      ⚠️  Ride not found in current data`);
          continue;
        }

        console.log(`      Status: ${ride.isOpen ? 'OPEN ✅' : 'CLOSED 🔕'}`);

        // Only notify if ride is now open
        if (!ride.isOpen) {
          console.log(`      ⏳ Still closed, monitoring...`);
          continue;
        }

        // Check if user has SMS email configured
        if (!alert.accessToken.smsEmail) {
          console.log(`      ⚠️  No SMS email configured for user`);
          continue;
        }

        console.log(`      ✅ RIDE REOPENED! Sending notification...`);

        // Send notification
        try {
          await sendRideReopenEmail({
            rideName: alert.rideName,
            smsEmail: alert.accessToken.smsEmail,
          });

          // Deactivate alert after notification (no throttling - one alert, one notification)
          await prisma.rideReopenAlert.update({
            where: { id: alert.id },
            data: { 
              lastNotified: new Date(),
              isActive: false, // Deactivate after sending
            },
          });
        } catch (emailError: any) {
          console.log(`      ❌ Failed to send notification:`, emailError.message);
        }
      } catch (error: any) {
        console.error(`      ❌ Error processing reopen alert ${alert.id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error(`❌ Error in monitorReopenAlerts:`, error.message);
    throw error;
  }
}

/**
 * Auto-cancel all alerts at 23:59 Orlando time
 */
async function autoCancelAlertsAtEndOfDay() {
  try {
    // Get current Orlando time
    const orlandoTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const now = new Date(orlandoTime);
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Cancel at 23:59 (after 23:59 and before 00:01)
    if (hour === 23 && minute >= 59) {
      console.log('\n🕐 Auto-canceling all alerts at 23:59 Orlando time');
      
      // Cancel all wait time alerts
      const waitTimeResult = await prisma.rideAlert.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      console.log(`   Canceled ${waitTimeResult.count} wait time alert(s)`);
      
      // Cancel all reopen alerts
      const reopenResult = await prisma.rideReopenAlert.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      console.log(`   Canceled ${reopenResult.count} reopen alert(s)`);
    }
  } catch (error: any) {
    console.error(`❌ Error in autoCancelAlertsAtEndOfDay:`, error.message);
  }
}

/**
 * Main monitoring function with comprehensive error handling
 */
async function main() {
  const orlandoTime = new Date().toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`🎢 Ride Alert Monitor - ${orlandoTime} (Orlando Time)`);
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Check for end-of-day cancellation
    await autoCancelAlertsAtEndOfDay();
    
    // Monitor both types of alerts
    await monitorWaitTimeAlerts();
    await monitorReopenAlerts();
    
    console.log('\n✅ Monitoring cycle complete');
    lastSuccessfulCheck = new Date();
    consecutiveErrors = 0;
  } catch (error: any) {
    consecutiveErrors++;
    console.error('\n❌ Error in monitoring cycle:', error.message);
    console.error('Stack:', error.stack);
    
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error(`\n💥 CRITICAL: ${MAX_CONSECUTIVE_ERRORS} consecutive errors. Exiting for restart...`);
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  // Log health status
  const minutesSinceLastSuccess = Math.round((Date.now() - lastSuccessfulCheck.getTime()) / (60 * 1000));
  console.log(`\n🏥 Health: ${consecutiveErrors} errors, last success ${minutesSinceLastSuccess} min ago`);
}

/**
 * Run as daemon - continuous monitoring every 2 minutes
 */
async function runDaemon() {
  console.log('🚀 Orlando Insider - Ride Alert Monitoring Service');
  console.log('📊 Checking alerts every 2 minutes');
  console.log('⏰ Process will run continuously');
  console.log(`🆔 Process ID: ${process.pid}\n`);

  // Verify email configuration on startup
  console.log('🔧 Testing SMTP connection...');
  await testEmailConnection();

  // Set up graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  // Catch unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    consecutiveErrors++;
  });

  // Catch uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    consecutiveErrors++;
  });

  // Run immediately on start
  await main().catch((error) => {
    console.error('💥 Error in initial run:', error.message);
  });

  // Then run every 2 minutes
  setInterval(async () => {
    await main().catch((error) => {
      console.error('💥 Error in monitoring cycle:', error.message);
    });
  }, 2 * 60 * 1000); // 2 minutes

  // Keep process alive with heartbeat
  setInterval(() => {
    const uptime = Math.round(process.uptime() / 60);
    console.log(`\n💓 Heartbeat: Service alive for ${uptime} minutes`);
  }, 10 * 60 * 1000); // Every 10 minutes
}

// Start the daemon
runDaemon()
  .catch((error) => {
    console.error('💥 Fatal daemon error:', error);
    process.exit(1);
  });
