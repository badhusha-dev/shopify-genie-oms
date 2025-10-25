import { Router } from 'express';
import { register, login, me, logout } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;

