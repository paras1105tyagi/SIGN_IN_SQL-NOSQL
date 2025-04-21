const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Check if email credentials are properly configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your-email@gmail.com') {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Email credentials not properly configured in .env file. Email sending will fail.');
  console.warn('\x1b[33m%s\x1b[0m', 'Please set real values for EMAIL_USER and EMAIL_PASS in your .env file.');
}

// Configure transporter based on environment
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error);
    console.error('Please check your email configuration in .env file');
  } else {
    console.log('Email service is ready to send messages');
  }
});

/**
 * Send verification email to user
 * @param {string} email - User's email
 * @param {string} token - Verification token
 * @param {string} userId - User's ID
 */
const sendVerificationEmail = async (email, token, userId) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.error('Email credentials not properly configured. Cannot send verification email.');
    return false;
  }

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${userId}/${token}`;
  console.log(`Generated verification link: ${verificationLink}`);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send account deletion confirmation email
 * @param {string} email - User's email
 * @param {string} token - Deletion token
 * @param {string} userId - User's ID
 */
const sendDeletionConfirmationEmail = async (email, token, userId) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.error('Email credentials not properly configured. Cannot send deletion confirmation email.');
    return false;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const deletionLink = `${frontendUrl}/confirm-deletion/${userId}/${token}`;
  console.log(`Generated deletion link: ${deletionLink}`);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Deletion Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #e74c3c;">Account Deletion Request</h2>
        <p>We received a request to delete your account. Please confirm by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${deletionLink}" style="background-color: #e74c3c; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm Account Deletion</a>
        </div>
        
        <p>If you didn't request this, you can safely ignore this email and your account will remain active.</p>
        <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          Please do not reply to this email. If you have any questions, please contact support.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Deletion confirmation email sent to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Using frontend URL: ${frontendUrl}`);
    return true;
  } catch (error) {
    console.error('Error sending deletion confirmation email:', error);
    console.error(`Current frontend URL: ${frontendUrl}`);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendDeletionConfirmationEmail
}; 