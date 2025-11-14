import { Router } from "express";
import { MaquinaController } from "../controllers/MaquinaController";

const router = Router();
const controller = new MaquinaController();

router.get('/:id', controller.getById);
router.get('/', controller.getAllMaquinas);
router.post('/', controller.createMaquina);
router.put('/:id', controller.updateMaquina);
router.delete('/:id', controller.deleteMaquina)

export default router;