import { Router } from "express";
import { CargoController } from "../controllers/CargoController";

const router = Router();
const controller = new CargoController();

router.get('/', controller.getAllCargos);

export default router;