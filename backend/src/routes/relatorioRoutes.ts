import express from "express";
import {
  getMTTRGeral,
  getMTTRPorMaquina,
  getMTBFGeral,
  getDisponibilidadeGeral,
  getOsConcluidasGeral,
  // 🔹 lembrando de importar
} from "../controllers/relatorioController";

const router = express.Router();

// --- MTTR ---
router.get("/mttr-geral", getMTTRGeral);
router.get("/mttr-maquina", getMTTRPorMaquina);

// --- MTBF ---
router.get("/mtbf-geral", getMTBFGeral);

// --- DISPONIBILIDADE ---
router.get("/disponibilidade-geral", getDisponibilidadeGeral);

// --- OS CONCLUÍDAS ---
router.get("/os-concluidas-geral", getOsConcluidasGeral);

export default router;
