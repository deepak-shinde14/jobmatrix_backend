import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  refreshToken, 
  logout,
  changePassword,
  updateEmail,
  updateProfile,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/update-email', protect, updateEmail);
router.put('/update-profile', protect, updateProfile);
router.delete('/delete-account', protect, deleteAccount);

export default router;