import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  getUsers, 
  changeRole, 
  toggleBan, 
  getAuditLogs 
} from '../controllers/admin.controller.js';

const router = Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/role', changeRole);
router.patch('/users/:id/ban', toggleBan);
router.get('/audit-logs', getAuditLogs);

export default router;
