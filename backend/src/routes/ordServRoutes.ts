import { Router } from "express";
import { EstadoRepository } from "../repositories/EstadoRepository";
import { OrdServRepository } from "../repositories/OrdServRepository";
import { OrdServController } from "../controllers/OrdServController";

const estadoRepo = new EstadoRepository();
const ordServRepo = new OrdServRepository(estadoRepo);
const osController = new OrdServController(ordServRepo);

const router = Router();

router.get("/dashboard", osController.getDashboardData);

router.get("/abertas", osController.getOSAbertas);
router.get("/manutentor/:id", osController.getByManutentor);
router.put("/aceitar/:id", osController.aceitarOrdServ);
router.get("/:id", osController.getById);
router.get("/", osController.getAllOrdServ);
router.post("/", osController.createOrdServ);
router.put("/:id", osController.updateOrdServ);
router.put("/finalizar/:id", osController.finalizarOrdServ);
router.delete("/:id", osController.deletarOS);

export default router;
