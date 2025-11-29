import express from "express";
import {
  getMTTRGeral,
  getMTTRPorMaquina,
} from "../controllers/relatorioController";

const router = express.Router();

// MTTR Geral
router.get("/mttr-geral", getMTTRGeral);

// MTTR por Máquina
router.get("/mttr-maquina", getMTTRPorMaquina);

export default router;
