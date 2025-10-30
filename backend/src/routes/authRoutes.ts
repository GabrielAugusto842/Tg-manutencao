import { Router } from 'express';
import { login, checkToken, trocarSenha } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get("/checktoken", checkToken);
router.put("/trocar-senha", authMiddleware, trocarSenha);

export default router
