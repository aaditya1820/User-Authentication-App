import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  getSessions, 
  revokeSession,
  enable2FA,
  verify2FASetup
} from '../controllers/user.controller.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.get('/me/sessions', getSessions);
router.delete('/me/sessions/:id', revokeSession);

router.post('/me/2fa/enable', enable2FA);
router.post('/me/2fa/verify', verify2FASetup);

export default router;
