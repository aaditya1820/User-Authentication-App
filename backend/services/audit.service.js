import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

export const logAudit = async (userId, action, req, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (error) {
    logger.error(`Audit Log error: ${error.message}`);
  }
};
