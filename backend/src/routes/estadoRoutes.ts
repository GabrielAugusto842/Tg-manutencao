import { Router } from "express";
import { EstadoController } from "../controllers/EstadoController";

const router = Router();
const controller = new EstadoController();

router.get("/", controller.getAllEstados);

export default router;
