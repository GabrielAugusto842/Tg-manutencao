import { Request, Response } from "express";
import { db } from "../config/db"; // seu MySQL ou outro banco

// Exemplo de MTTR geral
export const getMTTRGeral = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
            SELECT AVG(TIMESTAMPDIFF(HOUR, data_inicio, data_termino)) AS mttr
            FROM ordem_servico
            WHERE data_inicio IS NOT NULL AND data_termino IS NOT NULL
        `) as any;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao calcular MTTR" });
  }
};

// MTTR por máquina
export const getMTTRPorMaquina = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
            SELECT m.nome AS maquina,
                   AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)) AS mttr
            FROM ordem_servico o
            JOIN maquina m ON o.id_maquina = m.id_maquina
            WHERE o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL
            GROUP BY m.id_maquina
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao calcular MTTR por máquina" });
  }
};
