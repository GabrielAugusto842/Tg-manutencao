import { Router } from "express";
import { SetorController } from "../controllers/SetorController";

const router = Router();
const controller = new SetorController();

router.get('/:id', controller.getById);
router.get('/', controller.getAllSetores);
router.post('/', controller.createSetor);
router.put('/:id', controller.updateSetor);
router.delete('/:id', controller.deleteSetor)

export default router;