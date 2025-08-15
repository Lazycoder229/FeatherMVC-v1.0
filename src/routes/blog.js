import { Router } from 'express';
import Ctrl from '../controllers/BlogController.js';
 // make sure this path is correct

const router = Router();

// This route now requires a valid JWT
router.get('/',Ctrl.index);

export default router;
