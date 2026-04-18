import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import logger from './logger.js';

const KEYS_DIR = path.resolve('keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

const ensureKeys = () => {
  if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
    return {
      privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    };
  }

  if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR);

  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    logger.info('Generating new RSA key pair for JWT...');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
  }

  return {
    privateKey: fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'),
    publicKey: fs.readFileSync(PUBLIC_KEY_PATH, 'utf8'),
  };
};

const { privateKey, publicKey } = ensureKeys();

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (payload, rememberMe = false) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: rememberMe ? '30d' : '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  } catch (error) {
    return null;
  }
};
