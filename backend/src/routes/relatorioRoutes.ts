import express from "express";
import {
  getMTTRGeral,
  getMTTRMaquina,
  getMTBFGeral,
  getCustoTotalGeral,
  getMTTAGeral,
  getBacklogOsGeral, // Importação da nova função
  getBacklogOsDetalhado,
  getMTTRAnual,
  getMTBFAnual, // Importação da nova função
  getMTTAAnual,
  getRankingMaquinasOrdens,
  getRankingMaquinasCusto,
  getRankingSetoresOrdens,
  getRankingSetoresCusto,
  getRankingUsuariosOrdens,
  getRankingUsuariosCusto,
  getMTBFMaquina,
  getMTTAMaquina,
  getCustoMaquina,
} from "../controllers/RelatorioController";

const router = express.Router();

router.get("/mtta-geral", getMTTAGeral);

// --- MTTR ---
router.get("/mttr-geral", getMTTRGeral);

// --- MTBF ---
router.get("/mtbf-geral", getMTBFGeral);

// --- CUSTO ---
router.get("/custo-total-geral", getCustoTotalGeral);

// --- BACKLOG ---
router.get("/backlog-os-geral", getBacklogOsGeral); // Novo endpoint
router.get("/backlog-os-detalhado", getBacklogOsDetalhado); // Novo endpoint

router.get("/mttr-anual", getMTTRAnual);

router.get("/mtbf-anual", getMTBFAnual);

router.get("/mtta-anual", getMTTAAnual);

router.get("/ranking/maquinas-ordens", getRankingMaquinasOrdens);

router.get("/ranking/maquinas-custos", getRankingMaquinasCusto);

router.get("/ranking/setores-ordens", getRankingSetoresOrdens);

router.get("/ranking/setores-custos", getRankingSetoresCusto);

router.get("/ranking/usuarios-ordens", getRankingUsuariosOrdens);

router.get("/ranking/usuarios-custos", getRankingUsuariosCusto);

router.get("/mttr-maquina", getMTTRMaquina);

router.get("/mtbf-maquina", getMTBFMaquina);

router.get("/mtta-maquina", getMTTAMaquina);

router.get("/custo-maquina", getCustoMaquina);

export default router;
