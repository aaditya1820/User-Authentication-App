import { Router } from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  logout, 
  refresh, 
  verifyEmail, 
  forgotPassword, 
  verifyResetToken, 
  resetPassword 
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js';
import prisma from '../utils/prisma.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);

router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), async (req, res) => {
  const user = req.user;
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), async (req, res) => {
  const user = req.user;
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`);
});

export default router;
