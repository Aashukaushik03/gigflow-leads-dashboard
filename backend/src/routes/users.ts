import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate, authorize('admin'));

// GET /api/users — list all users (admin only)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ success: true, message: 'Users fetched', data: { users } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id/role — change user role (admin only)
router.patch('/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['admin', 'sales'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: 'Role updated', data: { user } });
  } catch (error) {
    next(error);
  }
});

export default router;
