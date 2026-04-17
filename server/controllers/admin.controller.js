import prisma from '../utils/prisma.js';
import { logAudit } from '../services/audit.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, role: true, isVerified: true, isBanned: true, createdAt: true
      }
    });

    const total = await prisma.user.count({ where });

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    await logAudit(req.user.id, 'ADMIN_CHANGE_ROLE', req, { targetUserId: id, newRole: role });
    res.json({ message: 'Role updated', user });
  } catch (error) {
    next(error);
  }
};

export const toggleBan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned: !user.isBanned },
    });

    await logAudit(req.user.id, updatedUser.isBanned ? 'ADMIN_BAN_USER' : 'ADMIN_UNBAN_USER', req, { targetUserId: id });
    res.json({ message: `User ${updatedUser.isBanned ? 'banned' : 'unbanned'}`, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } }
    });

    const total = await prisma.auditLog.count({ where });
    res.json({ logs, total });
  } catch (error) {
    next(error);
  }
};
