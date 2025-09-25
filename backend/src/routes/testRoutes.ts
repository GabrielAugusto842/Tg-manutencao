import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";

console.log("testRoutes carregado");

const router = Router();
const usuarioController = new UsuarioController();

// Rota base para teste
router.get("/", (req, res) => {
  res.json({ message: "Rota base /api/user funcionando" });
});

router.get("/:email", (req, res) => {
  console.log("GET /api/user/:email chamado com:", req.params.email);
  usuarioController.getUsuario(req, res);
});

export default router;