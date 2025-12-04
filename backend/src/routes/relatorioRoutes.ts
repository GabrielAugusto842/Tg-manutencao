import express from "express";
import {
 getMTTRGeral,
 getMTTRPorMaquina,
 getMTBFGeral,
 getCustoTotalGeral,
 getMTTAGeral,
 getBacklogOsGeral, // Importação da nova função
 getBacklogOsDetalhado,
 getMTTRAnual, 
 getMTBFAnual, // Importação da nova função
 getMTTAAnual
} from "../controllers/relatorioController";

const router = express.Router();


router.get("/mtta-geral", getMTTAGeral);

// --- MTTR ---
router.get("/mttr-geral", getMTTRGeral);
router.get("/mttr-maquina", getMTTRPorMaquina);

// --- MTBF ---
router.get("/mtbf-geral", getMTBFGeral);

// --- CUSTO ---
router.get("/custo-total-geral", getCustoTotalGeral);

// --- BACKLOG ---
router.get("/backlog-os-geral", getBacklogOsGeral); // Novo endpoint
router.get("/backlog-os-detalhado", getBacklogOsDetalhado); // Novo endpoint

router.get("/mttr-anual", getMTTRAnual);

router.get("/mtbf-anual", getMTBFAnual);

router.get("/mtta-anual", getMTTAAnual)



export default router;
