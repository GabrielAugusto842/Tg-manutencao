import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const usuarioController = new UsuarioController();

console.log("usuarioRoutes.ts carregado!");


router.get("/", (req, res) => {
  usuarioController.getUsuarios(req, res);
});

router.get("/:email", (req, res) => {
  usuarioController.getUsuario(req, res);
});

router.put("/trocar-senha", authMiddleware, (req, res) => {
  console.log("Rota /trocar-senha chamada!");
  usuarioController.trocarSenha(req, res);
});

export default router;
