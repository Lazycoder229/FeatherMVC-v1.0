import { Router } from 'express';
import Ctrl from '../controllers/FeatureController.js';
const router = Router();
router.get('/', Ctrl.index);
export default router;
