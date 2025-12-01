import express from "express";
import {
  getMTTRGeral,
  getMTTRPorMaquina,
  getMTBFGeral,
  getDisponibilidadeGeral,
  getOsConcluidasGeral,
  getCustoTotalGeral,
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

// --- CUSTO ---
router.get("/custo-total-geral", getCustoTotalGeral);

// --- BACKLOG ---

export default router;
