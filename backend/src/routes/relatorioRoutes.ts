import express from "express";
import {
  getMTTRGeral,
  getMTTRPorMaquina,
  getMTBFGeral,
  getMTBFPorMaquina,
  getDashboardMaquina,
  getDisponibilidadeGeral, // ✅ ADICIONADO
  getOsConcluidasGeral, // ✅ ADICIONADO
} from "../controllers/relatorioController"; // Certifique-se de que as funções estão exportadas aqui

const router = express.Router();

// --- ROTAS MTTR ---
// MTTR Geral
router.get("/mttr-geral", getMTTRGeral);

// MTTR por Máquina
router.get("/mttr-maquina", getMTTRPorMaquina);

// --- ROTAS MTBF ---
// 🥇 MTBF Geral
router.get("/mtbf-geral", getMTBFGeral);

// 🥈 MTBF por Máquina
router.get("/mtbf-maquina", getMTBFPorMaquina);

// --- ROTAS DISPONIBILIDADE e O.S. ---
// 🥉 Disponibilidade Geral
router.get("/disponibilidade-geral", getDisponibilidadeGeral); // ✅ NOVA ROTA

// 🏅 O.S. Concluídas Geral
router.get("/os-concluidas-geral", getOsConcluidasGeral); // ✅ NOVA ROTA

// --- OUTRAS ROTAS ---
// Dashboard por Máquina (MTTR, MTBF, Disponibilidade, Confiabilidade)
router.get("/dashboard-maquina", getDashboardMaquina);

export default router;
