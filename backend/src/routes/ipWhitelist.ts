import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCurrentIp,
  addIp,
  removeIp,
  getWhitelist,
  toggleRestriction,
} from '../controllers/ipWhitelistController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get current client IP
router.get('/current-ip', getCurrentIp);

// Get IP whitelist
router.get('/', getWhitelist);

// Add IP to whitelist
router.post('/add', addIp);

// Remove IP from whitelist
router.delete('/:ipId', removeIp);

// Toggle IP restriction on/off
router.patch('/toggle', toggleRestriction);

export default router;