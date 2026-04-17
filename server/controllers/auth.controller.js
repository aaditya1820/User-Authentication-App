import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp.js';
import { logAudit } from '../services/audit.service.js';
import logger from '../utils/logger.js';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Registered successfully
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await (prisma.otpToken || prisma.oTPToken).create({
      data: {
        userId: user.id,
        code: verificationToken, 
        type: 'VERIFY_EMAIL',
        expiresAt,
      },
    });

    await sendVerificationEmail(email, verificationToken);
    await logAudit(user.id, 'USER_REGISTERED', req);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               rememberMe: { type: boolean }
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account is banned' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id }, rememberMe);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    });

    await logAudit(user.id, 'USER_LOGIN', req);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    const accessToken = generateAccessToken({ id: session.user.id, role: session.user.role });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const otpToken = await (prisma.otpToken || prisma.oTPToken).findFirst({
      where: {
        code: token,
        type: 'VERIFY_EMAIL',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpToken) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: otpToken.userId },
      data: { isVerified: true },
    });

    await (prisma.otpToken || prisma.oTPToken).update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    await logAudit(otpToken.userId, 'EMAIL_VERIFIED', req);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    await (prisma.otpToken || prisma.oTPToken).create({
      data: {
        userId: user.id,
        code: token,
        type: 'RESET_PASSWORD',
        expiresAt,
      },
    });

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

export const verifyResetToken = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const otpToken = await (prisma.otpToken || prisma.oTPToken).findFirst({
      where: {
        userId: user.id,
        code: token,
        type: 'RESET_PASSWORD',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpToken) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    res.json({ message: 'Link verified', resetToken: token });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const otpToken = await (prisma.otpToken || prisma.oTPToken).findFirst({ 
      where: { 
        code: resetToken,
        userId: user.id,
        type: 'RESET_PASSWORD',
        used: false,
        expiresAt: { gt: new Date() }
      } 
    });

    if (!otpToken) {
      return res.status(400).json({ message: 'Invalid or expired reset session' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await (prisma.otpToken || prisma.oTPToken).update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    await logAudit(user.id, 'PASSWORD_RESET', req);

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};
