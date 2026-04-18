import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Authentication System" <user.authentication@gmail.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f9fafb; border-radius: 24px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; padding: 12px; background-color: #6366f1; border-radius: 12px; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 16px; letter-spacing: -0.025em;">Secure Your Account</h1>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; text-align: center; margin-bottom: 32px;">Please verify your email address to complete your account setup and unlock all features.</p>
      <div style="text-align: center;">
        <a href="${url}" style="display: inline-block; background-color: #6366f1; color: white; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">Verify Email Address</a>
      </div>
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(email, 'Verify your email', html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f9fafb; border-radius: 24px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; padding: 12px; background-color: #10b981; border-radius: 12px; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
      </div>
      <h1 style="color: #111827; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 16px; letter-spacing: -0.025em;">Password Recovery</h1>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; text-align: center; margin-bottom: 32px;">We received a request to reset your password. Click the button below to choose a new secure password. This link will expire in 10 minutes.</p>
      <div style="text-align: center;">
        <a href="${url}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">Reset My Password</a>
      </div>
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(email, 'Reset your password', html);
};
