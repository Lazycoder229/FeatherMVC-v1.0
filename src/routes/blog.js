import { Router } from 'express';
import Ctrl from '../controllers/BlogController.js';
const router = Router();
router.get('/', Ctrl.index);
export default router;
