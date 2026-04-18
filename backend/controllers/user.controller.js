import prisma from '../utils/prisma.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logAudit } from '../services/audit.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, avatar: true, role: true,
        isVerified: true, twoFactorEnabled: true, createdAt: true
      }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const data = { name };
    if (email && email !== req.user.email) {
      data.email = email;
      data.isVerified = false;

    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    await logAudit(user.id, 'PROFILE_UPDATED', req);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
    });

    res.json({ message: 'Avatar uploaded successfully', avatarUrl });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.session.delete({
      where: { id, userId: req.user.id }
    });
    res.json({ message: 'Session revoked' });
  } catch (error) {
    next(error);
  }
};

export const enable2FA = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ name: `AuthSystem (${req.user.email})` });
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    next(error);
  }
};

export const verify2FASetup = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: true },
    });

    await logAudit(user.id, '2FA_ENABLED', req);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
};
