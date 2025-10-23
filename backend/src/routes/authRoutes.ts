import { Router } from 'express';
import { login, checkToken } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.get("/checktoken", checkToken);

export default router
