import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";

const router = Router();
const usuarioController = new UsuarioController();

router.get("/:email", (req, res) => usuarioController.getUsuario(req, res));

export default router;