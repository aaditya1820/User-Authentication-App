import nodemailer from 'nodemailer';
import logger from './logger.js';
import { env } from './env.js';

const smtpHost = env.SMTP_HOST;
const smtpUser = env.SMTP_USER?.replace(/^["']|["']$/g, ''); // Strip surrounding quotes if present
const smtpPass = env.SMTP_PASS?.replace(/^["']|["']$/g, '');

const transportConfig = smtpHost.includes('gmail')
  ? {
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }
  : {
      host: smtpHost,
      port: parseInt(env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

const transporter = nodemailer.createTransport(transportConfig);

export const sendEmail = async (to, subject, html) => {
  // Resolve Brevo API key: explicitly provided BREVO_API_KEY, fallback to env validation,
  // or automatically extract from Brevo SMTP credentials if using smtp-relay.brevo.com
  const brevoApiKey = process.env.BREVO_API_KEY?.replace(/^["']|["']$/g, '') || 
                       env.BREVO_API_KEY || 
                       (smtpHost.includes('brevo.com') ? smtpPass : null);

  if (brevoApiKey) {
    try {
      logger.info(`Sending email via Brevo SMTP HTTP API to ${to}...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'ShieldAuth', email: env.EMAIL_FROM },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || JSON.stringify(resData));
      }

      logger.info(`Email sent via Brevo HTTP API successfully to ${to}`);
      return resData;
    } catch (error) {
      logger.error(`Error sending email via Brevo HTTP API: ${error.message}. Trying SMTP fallback...`);
    }
  }

  // Fallback to standard SMTP if Brevo HTTP API is not configured or fails
  try {
    const info = await transporter.sendMail({
      from: `"ShieldAuth" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent via SMTP fallback: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email via SMTP fallback: ${error.message}`);
    throw error;
  }
};

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  logger.info(`🔑 Verification link for ${email}: ${url}`);
  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 48px 20px; text-align: center; color: #1e293b; line-height: 1.6; min-height: 100%;">
      <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #f1f5f9;">
        <!-- Top Accent Bar -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); height: 8px;"></div>
        
        <div style="padding: 44px 40px; text-align: center;">
          <!-- Brand Badge -->
          <div style="margin-bottom: 28px;">
            <span style="background-color: #e0e7ff; color: #6366f1; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 18px; border-radius: 9999px; font-family: 'Inter', sans-serif;">
              ShieldAuth Secure
            </span>
          </div>
          
          <!-- Heading -->
          <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.2;">Verify your email address</h1>
          
          <!-- Message -->
          <p style="font-size: 16px; color: #475569; margin: 0 0 32px 0; line-height: 1.6;">Welcome! To unlock all premium features and secure your account, please click the button below to verify your email address.</p>
          
          <!-- CTA Button -->
          <div style="margin-bottom: 36px;">
            <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.35);">
              Confirm Verification
            </a>
          </div>
          
          <!-- Alternative Link -->
          <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">If the button doesn't work, copy and paste this link in your browser:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; word-break: break-all; font-family: monospace; font-size: 13px; color: #4f46e5; text-align: left; margin-bottom: 32px;">
            ${url}
          </div>
          
          <!-- Divider & Footer Context -->
          <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 24px; text-align: left;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">This link will expire in 24 hours. If you did not sign up for this account, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; 2026 ShieldAuth Corp. All rights reserved.
      </div>
    </div>
  `;
  return sendEmail(email, 'Verify your email', html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
  logger.info(`🔑 Reset link for ${email}: ${url}`);
  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 48px 20px; text-align: center; color: #1e293b; line-height: 1.6; min-height: 100%;">
      <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #f1f5f9;">
        <!-- Top Accent Bar -->
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); height: 8px;"></div>
        
        <div style="padding: 44px 40px; text-align: center;">
          <!-- Brand Badge -->
          <div style="margin-bottom: 28px;">
            <span style="background-color: #ccfbf1; color: #0d9488; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 18px; border-radius: 9999px; font-family: 'Inter', sans-serif;">
              ShieldAuth Security
            </span>
          </div>
          
          <!-- Heading -->
          <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.2;">Password recovery request</h1>
          
          <!-- Message -->
          <p style="font-size: 16px; color: #475569; margin: 0 0 32px 0; line-height: 1.6;">We received a request to reset your password. Click the secure button below to choose a new secure password.</p>
          
          <!-- CTA Button -->
          <div style="margin-bottom: 36px;">
            <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.35);">
              Reset My Password
            </a>
          </div>
          
          <!-- Alternative Link -->
          <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">If the button doesn't work, copy and paste this link in your browser:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; word-break: break-all; font-family: monospace; font-size: 13px; color: #0d9488; text-align: left; margin-bottom: 32px;">
            ${url}
          </div>
          
          <!-- Divider & Footer Context -->
          <div style="border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 24px; text-align: left;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">This link will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email and your account remains secure.</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; 2026 ShieldAuth Corp. All rights reserved.
      </div>
    </div>
  `;
  return sendEmail(email, 'Reset your password', html);
};
