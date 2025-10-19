import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";

const router = Router();
const usuarioController = new UsuarioController();

// Rota base para teste
router.get("/", (req, res) => {
  usuarioController.getUsuarios(req, res);
});

router.get("/:email", (req, res) => {
  console.log("GET /api/user/:email chamado com:", req.params.email);
  usuarioController.getUsuario(req, res);
});


export default router;