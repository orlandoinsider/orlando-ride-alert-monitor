import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface RideAlertEmailData {
  rideName: string;
  parkName: string;
  currentWaitTime: number;
  targetWaitTime: number;
  email: string;
  smsEmail?: string;
  userName?: string;
}

export async function sendRideAlertEmail(data: RideAlertEmailData): Promise<void> {
  const {
    rideName,
    parkName,
    currentWaitTime,
    targetWaitTime,
    email,
    smsEmail,
    userName,
  } = data;

  // Simple message format
  const message = `Go, go, go! ${rideName} is now at ${currentWaitTime} minutes. Have fun!`;
  
  try {
    // Send to main email address
    if (email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: '', // Blank subject
        text: message,
      });
      console.log(`✅ Ride alert email sent to ${email}`);
    }

    // Send to SMS email (same message)
    if (smsEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: smsEmail,
        subject: '', // Blank subject
        text: message,
      });
      console.log(`✅ Ride alert SMS sent to ${smsEmail}`);
    }
  } catch (error) {
    console.error('❌ Error sending ride alert email:', error);
    throw error;
  }
}

export interface RideReopenEmailData {
  rideName: string;
  smsEmail: string;
}

export async function sendRideReopenEmail(data: RideReopenEmailData): Promise<void> {
  const { rideName, smsEmail } = data;

  // Simple message format
  const message = `Hurray! ${rideName} is now open. Have fun!`;
  
  try {
    // Send to SMS email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: smsEmail,
      subject: '', // Blank subject
      text: message,
    });
    console.log(`✅ Ride reopen SMS sent to ${smsEmail}`);
  } catch (error) {
    console.error('❌ Error sending ride reopen email:', error);
    throw error;
  }
}

// Test function to verify SMTP configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
