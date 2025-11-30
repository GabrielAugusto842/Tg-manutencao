import { Request, Response } from "express";
import { db } from "../config/db"; // seu MySQL ou outro banco

interface MttrResult {
  mttr: number | null;
}

interface MttrPorMaquinaResult {
  maquina: string;
  mttr: number | null;
}

// Exemplo de MTTR geral
export const getMTTRGeral = async (req: Request, res: Response) => {
  // ... (Lógica de data e queryParams omitida para brevidade)
  const { dataInicial, dataFinal } = req.query;
  let whereCondition =
    "id_estado = 3 AND data_inicio IS NOT NULL AND data_termino IS NOT NULL";
  const queryParams: (string | string)[] = [];
  if (dataInicial && dataFinal) {
    whereCondition += " AND data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    // CORREÇÃO DA TIPAGEM: Usar 'unknown' e definir a tupla para MttrResult[]
    const [rows] = (await db.query(
      `
            SELECT IFNULL(AVG(TIMESTAMPDIFF(HOUR, data_inicio, data_termino)), 0) AS mttr
            FROM ordem_servico
            WHERE ${whereCondition}
         `,
      queryParams
    )) as unknown as [MttrResult[], any]; // <--- APLICAÇÃO CORRETA // O 'rows' agora é um MttrResult[]

    res.json({ mttr: rows[0]?.mttr ?? 0 });
  } catch (err) {
    console.error("Erro ao calcular MTTR geral:", err);
    res.status(500).json({ error: "Erro ao calcular MTTR" });
  }
};
// MTTR por máquina
export const getMTTRPorMaquina = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;
  let whereCondition =
    "o.id_estado = 3 AND o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL";
  const queryParams: string[] = [];

  if (dataInicial && dataFinal) {
    whereCondition += " AND o.data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    const [rows] = (await db.query(
      `
        SELECT 
          m.id_maquina,
          m.nome AS maquina,
          m.tag,
          IFNULL(AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS mttr
        FROM ordem_servico o
        JOIN maquina m ON o.id_maquina = m.id_maquina
        WHERE ${whereCondition}
        GROUP BY m.id_maquina, m.nome, m.tag
        ORDER BY m.id_maquina
      `,
      queryParams
    )) as unknown as [
      { id_maquina: number; maquina: string; tag: string; mttr: number }[],
      any
    ];

    res.json(rows);
  } catch (err) {
    console.error("Erro ao calcular MTTR por máquina:", err);
    res.status(500).json({ error: "Erro ao calcular MTTR por máquina" });
  }
};

export const getDashboardMaquina = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;

  let whereCondition =
    "o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL";
  const queryParams: string[] = [];

  if (dataInicial && dataFinal) {
    whereCondition += " AND o.data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    const [rows] = (await db.query(
      `
      SELECT 
        m.id_maquina,
        m.nome,
        m.tag,
        m.disponibilidade_mes,
        IFNULL(AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS mttr
      FROM maquina m
      LEFT JOIN ordem_servico o ON o.id_maquina = m.id_maquina
      WHERE 1=1
      GROUP BY m.id_maquina, m.nome, m.tag, m.disponibilidade_mes
      `,
      queryParams
    )) as unknown as [
      {
        id_maquina: number;
        nome: string;
        tag: string;
        disponibilidade_mes: number;
        mttr: number;
      }[],
      any
    ];

    const dashboard = rows.map((r) => {
      const mtbf = (r.disponibilidade_mes / 100) * 720; // exemplo: disponibilidade em % * 30 dias * 24h = horas
      const confiabilidadeHorizonteHoras = 10;
      const confiabilidade =
        Math.exp(-confiabilidadeHorizonteHoras / (mtbf || 1)) * 100;

      return {
        idMaquina: r.id_maquina,
        maquina: r.nome,
        tag: r.tag,
        mttr: r.mttr,
        mtbf,
        disponibilidade: r.disponibilidade_mes,
        confiabilidade,
      };
    });

    res.json(dashboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar dashboard por máquina" });
  }
};

// NOVO: Exemplo de MTBF geral
export const getMTBFGeral = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;
  let whereCondition =
    "id_estado = 3 AND data_inicio IS NOT NULL AND data_termino IS NOT NULL";
  const queryParams: (string | string)[] = [];
  if (dataInicial && dataFinal) {
    whereCondition += " AND data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    // 1. Calcula o número de falhas e o tempo de parada total no período (em horas)
    const [stats] = (await db.query(
      `
            SELECT 
                COUNT(*) AS numero_falhas,
                IFNULL(SUM(TIMESTAMPDIFF(HOUR, data_inicio, data_termino)), 0) AS tempo_parada
            FROM ordem_servico
            WHERE ${whereCondition}
            `,
      queryParams
    )) as unknown as [{ numero_falhas: number; tempo_parada: number }[], any];

    const { numero_falhas, tempo_parada } = stats[0] ?? {
      numero_falhas: 0,
      tempo_parada: 0,
    };

    // 2. Calcula a duração total do período em horas
    // Se dataInicial e dataFinal não forem fornecidas, o cálculo fica complexo.
    // Vamos assumir 30 dias (720h) se datas não forem passadas, ou calcular a diferença:
    let tempo_total_periodo_horas = 720; // Default: 30 dias * 24h

    if (dataInicial && dataFinal) {
      const start = new Date(dataInicial as string);
      const end = new Date(dataFinal as string);
      // Duração em milissegundos / (1000ms * 60s * 60min) = Duração em horas
      // +24h para incluir o dia final completo
      const diffTime = Math.abs(end.getTime() - start.getTime());
      tempo_total_periodo_horas =
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)) * 24;
    }

    const tempo_operacional = tempo_total_periodo_horas - tempo_parada;

    // MTBF = Tempo Operacional Total / Número de Falhas
    const mtbf =
      numero_falhas > 0 ? tempo_operacional / numero_falhas : tempo_operacional; // Se 0 falhas, MTBF = Tempo Operacional

    res.json({ mtbf: Math.max(0, mtbf) }); // Garante que MTBF não seja negativo
  } catch (err) {
    console.error("Erro ao calcular MTBF geral:", err);
    res.status(500).json({ error: "Erro ao calcular MTBF" });
  }
};

// NOVO: MTBF por máquina
export const getMTBFPorMaquina = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;
  let whereCondition =
    "o.id_estado = 3 AND o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL";
  const queryParams: string[] = [];

  if (dataInicial && dataFinal) {
    whereCondition += " AND o.data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  // Calcula a duração total do período em horas (reutilizando a lógica do geral)
  let tempo_total_periodo_horas = 720;
  if (dataInicial && dataFinal) {
    const start = new Date(dataInicial as string);
    const end = new Date(dataFinal as string);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    tempo_total_periodo_horas =
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) * 24;
  }

  try {
    const [rows] = (await db.query(
      `
            SELECT 
                m.id_maquina,
                m.nome AS maquina,
                m.tag,
                COUNT(o.id_os) AS numero_falhas,
                IFNULL(SUM(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS tempo_parada_total
            FROM maquina m
            LEFT JOIN ordem_servico o ON o.id_maquina = m.id_maquina
            WHERE ${whereCondition}
            GROUP BY m.id_maquina, m.nome, m.tag
            ORDER BY m.id_maquina
            `,
      queryParams
    )) as unknown as [
      {
        id_maquina: number;
        maquina: string;
        tag: string;
        numero_falhas: number;
        tempo_parada_total: number;
      }[],
      any
    ];

    const mtbfResults = rows.map((r) => {
      const tempo_operacional =
        tempo_total_periodo_horas - r.tempo_parada_total;
      const mtbf =
        r.numero_falhas > 0
          ? tempo_operacional / r.numero_falhas
          : tempo_operacional;

      return {
        maquina: r.maquina,
        tag: r.tag,
        mtbf: Math.max(0, mtbf), // Garante MTBF não negativo
      };
    });

    res.json(mtbfResults);
  } catch (err) {
    console.error("Erro ao calcular MTBF por máquina:", err);
    res.status(500).json({ error: "Erro ao calcular MTBF por máquina" });
  }
};

// FUNÇÃO AJUSTADA: Disponibilidade Geral (usando o tempo cadastrado por máquina)
export const getDisponibilidadeGeral = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;
  const queryParams: (string | string)[] = [];

  // Apenas O.S. Finalizadas (os.id_estado = 3)
  let osWhereCondition =
    "os.id_estado = 3 AND os.data_inicio IS NOT NULL AND os.data_termino IS NOT NULL";

  if (dataInicial && dataFinal) {
    osWhereCondition += " AND os.data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    // 1. Calcula o Tempo Total de Parada (Soma do tempo de reparo de todas as O.S. CONCLUÍDAS)
    const [paradaResult] = (await db.query(
      `
            SELECT 
                SUM(TIMESTAMPDIFF(MINUTE, os.data_inicio, os.data_termino)) AS tempo_total_parada_min
            FROM ordem_servico os
            WHERE ${osWhereCondition}
            `,
      queryParams
    )) as unknown as [{ tempo_total_parada_min: number }[], any];

    const tempoTotalParadaMin = paradaResult[0]?.tempo_total_parada_min || 0;

    // 2. Calcula o Tempo Total Disponível Cadastrado (Denominador)
    let tempoTotalDisponivelMin = 0;

    // Se as datas forem fornecidas, calculamos o número de dias no período
    if (dataInicial && dataFinal) {
      const dataInicio = new Date(dataInicial as string);
      const dataFim = new Date(dataFinal as string);
      
      // Diferença em dias (arredondando para cima para incluir o dia final)
      const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
      const diasNoPeriodo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // 24 horas * 60 minutos = 1440 minutos por dia
      // O TEMPO DISPONÍVEL TOTAL será a SOMA da disponibilidade mensal cadastrada (em horas) convertida para minutos
      // e depois ajustada proporcionalmente pelos dias do período.

      const [disponivelResult] = (await db.query(
        `
              SELECT 
                  IFNULL(SUM(disponibilidade_mes), 0) AS tempo_disponivel_por_mes_horas
              FROM maquina;
              `
      )) as unknown as [{ tempo_disponivel_por_mes_horas: number }[], any];

      const tempoDisponivelPorMesHoras =
        disponivelResult[0]?.tempo_disponivel_por_mes_horas || 0;
      
      // Cálculo: Soma das Horas Mensais (disponibilidade_mes) * Fator de Ajuste (Dias do Período / 30 dias) * 60 minutos/hora
      const fatorAjuste = diasNoPeriodo / 30; // Usando 30 dias como base de 1 mês
      
      tempoTotalDisponivelMin = tempoDisponivelPorMesHoras * fatorAjuste * 60;

      // =================================================================
      // >>>>> LINHAS PARA DEBUG <<<<<
      // =================================================================
      console.log("--- DEBUG DISPONIBILIDADE GERAL ---");
      console.log(`Período (Dias): ${diasNoPeriodo}`);
      console.log(`Disponível por Máquina/Mês (Horas, SUM(disponibilidade_mes)): ${tempoDisponivelPorMesHoras}`);
      console.log(`Fator de Ajuste (dias/30): ${fatorAjuste.toFixed(2)}`);
      console.log(`Tempo Total Parada (Minutos): ${tempoTotalParadaMin}`);
      console.log(`Tempo Total Disponível (Minutos, DENOMINADOR): ${tempoTotalDisponivelMin.toFixed(2)}`);
      // =================================================================
      
      if (tempoTotalDisponivelMin <= 0) {
          console.error("ERRO: O Tempo Total Disponível (DENOMINADOR) é zero ou negativo. Verifique se o campo 'disponibilidade_mes' está preenchido na tabela 'maquina' com valores positivos (horas/mês).");
        return res.json({
          disponibilidade: 0,
          tempoOperacional: 0,
          tempoParada: parseFloat((tempoTotalParadaMin / 60).toFixed(2)),
        });
      }
    } else {
         // Se não há datas, usamos o padrão (apenas a soma mensal)
         const [disponivelResult] = (await db.query(
          `
                SELECT 
                    IFNULL(SUM(disponibilidade_mes), 0) AS tempo_disponivel_por_mes_horas
                FROM maquina;
                `
        )) as unknown as [{ tempo_disponivel_por_mes_horas: number }[], any];

        const tempoDisponivelPorMesHoras =
          disponivelResult[0]?.tempo_disponivel_por_mes_horas || 0;
        
        tempoTotalDisponivelMin = tempoDisponivelPorMesHoras * 60; // 1 mês * 60 minutos/hora

        // =================================================================
        // >>>>> LINHAS PARA DEBUG (sem datas) <<<<<
        // =================================================================
        console.log("--- DEBUG DISPONIBILIDADE GERAL (SEM DATAS) ---");
        console.log(`Disponível por Máquina/Mês (Horas, SUM(disponibilidade_mes)): ${tempoDisponivelPorMesHoras}`);
        console.log(`Tempo Total Parada (Minutos): ${tempoTotalParadaMin}`);
        console.log(`Tempo Total Disponível (Minutos, DENOMINADOR): ${tempoTotalDisponivelMin.toFixed(2)}`);
        // =================================================================

        if (tempoTotalDisponivelMin <= 0) {
             console.error("ERRO: O Tempo Total Disponível (DENOMINADOR) é zero ou negativo. Verifique se o campo 'disponibilidade_mes' está preenchido na tabela 'maquina' com valores positivos (horas/mês).");
            return res.json({
                disponibilidade: 0,
                tempoOperacional: 0,
                tempoParada: parseFloat((tempoTotalParadaMin / 60).toFixed(2)),
            });
        }
    }


    // 3. Calcula o Tempo Operacional
    const tempoOperacionalMin = tempoTotalDisponivelMin - tempoTotalParadaMin;

    // 4. Calcula a Disponibilidade (%)
    const disponibilidade =
      (tempoOperacionalMin / tempoTotalDisponivelMin) * 100;

    res.json({
      disponibilidade: Math.max(0, parseFloat(disponibilidade.toFixed(2))), // Formatação
      tempoOperacional: parseFloat((tempoOperacionalMin / 60).toFixed(2)), // Em Horas, Formatação
      tempoParada: parseFloat((tempoTotalParadaMin / 60).toFixed(2)), // Em Horas, Formatação
    });
  } catch (err) {
    console.error("Erro ao buscar Disponibilidade geral:", err);
    res.status(500).json({ error: "Erro ao buscar Disponibilidade geral" });
  }
};


// NOVO: O.S. Concluídas Geral
export const getOsConcluidasGeral = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal } = req.query;
  let whereCondition = "id_estado = 3"; // Filtra apenas O.S. com status Concluída
  const queryParams: (string | string)[] = [];

  // Filtra pelo período de conclusão, usando data_termino
  if (dataInicial && dataFinal) {
    whereCondition += " AND data_termino BETWEEN ? AND ?";
    queryParams.push(dataInicial as string, dataFinal as string);
  }

  try {
    const [stats] = (await db.query(
      `
            SELECT 
                COUNT(*) AS total_concluidas
            FROM ordem_servico
            WHERE ${whereCondition}
            `,
      queryParams
    )) as unknown as [{ total_concluidas: number }[], any];

    const { total_concluidas } = stats[0] ?? { total_concluidas: 0 };

    res.json({
      totalOsConcluidas: total_concluidas,
    });
  } catch (err) {
    console.error("Erro ao contar O.S. concluídas:", err);
    // Retorna 500 para indicar falha na API, que é capturada no frontend.
    res.status(500).json({ error: "Erro ao buscar O.S. concluídas" });
  }
};
