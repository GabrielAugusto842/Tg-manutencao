import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const usuarioController = new UsuarioController();


router.get("/", (req, res) => {
  usuarioController.getUsuarios(req, res);
});

router.get("/:email", (req, res) => {
  usuarioController.getUsuario(req, res);
});

router.post("/", usuarioController.cadastroUsuario.bind(usuarioController));


export default router;
