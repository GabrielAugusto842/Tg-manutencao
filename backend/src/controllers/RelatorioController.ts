import { Request, Response } from "express";
import { db } from "../config/db";

// Função auxiliar para calcular o tempo total em minutos no período definido.
// Se as datas não forem fornecidas, considera o período do MÊS atual (Month-to-Date).
function calculateTotalMinutes(dataInicial: any, dataFinal: any): number {
  if (dataInicial && dataFinal) {
    // Se as datas forem fornecidas, calcula a diferença entre elas
    const start = new Date(dataInicial as string);
    const end = new Date(dataFinal as string);
    const diffInMs = end.getTime() - start.getTime();
    // Retorna a diferença em minutos do período selecionado
    return diffInMs / (1000 * 60);
  }

  // Se as datas não forem fornecidas, considera o período do MÊS atual até hoje
  const today = new Date();
  // Obtém a data de 1º do MÊS atual
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Calcula a diferença em milissegundos do início do mês até agora
  const diffInMs = today.getTime() - startOfMonth.getTime();

  // Converte para minutos. Garante que seja pelo menos 1 minuto para evitar divisão por zero,
  // embora no cenário real este valor será sempre positivo.
  const totalMinutes = diffInMs / (1000 * 60);

  return totalMinutes > 0 ? totalMinutes : 24 * 60; // Pelo menos 1 dia (1440 min)
}

// Função auxiliar para calcular o tempo total em minutos do mês atual
function getTotalMinutesPeriod(
  dataInicial?: string,
  dataFinal?: string
): number {
  if (dataInicial && dataFinal) {
    const start = new Date(dataInicial);
    const end = new Date(dataFinal);
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutos
  }

  // Mês atual
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return (today.getTime() - startOfMonth.getTime()) / (1000 * 60); // minutos
}

// -------------------------------
// MTTR GERAL (CORRETO)
// -------------------------------
export async function getMTTRGeral(req: Request, res: Response) {
  try {
    const { dataInicial, dataFinal, idSetor } = req.query;
    const params: any[] = [];
    let where = "WHERE o.data_termino IS NOT NULL";

    if (dataInicial) {
      where += " AND o.data_inicio >= ?";
      params.push(dataInicial);
    }
    if (dataFinal) {
      where += " AND o.data_termino <= ?";
      params.push(dataFinal);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
SELECT 
AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)) AS mttr
FROM ordem_servico o
JOIN maquina m ON m.id_maquina = o.id_maquina
${where}
`;

    const [rows]: any = await db.query(query, params);
    res.json({ mttr: rows[0]?.mttr ?? 0 });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao calcular MTTR" });
  }
}

// -------------------------------
// MTTR POR MÁQUINA (CORRETO)
// -------------------------------
export const getMTTRPorMaquina = async (req: Request, res: Response) => {
  const { dataInicial, dataFinal, idSetor } = req.query;
  const params: string[] = [];
  let where = `
o.id_estado = 3 
AND o.data_inicio IS NOT NULL 
AND o.data_termino IS NOT NULL
`;

  if (dataInicial && dataFinal) {
    where += " AND o.data_termino BETWEEN ? AND ?";
    params.push(dataInicial as string, dataFinal as string);
  }
  if (idSetor) {
    where += " AND m.id_setor = ?";
    params.push(idSetor as string);
  }

  try {
    const [rows]: any = await db.query(
      `
SELECT 
m.id_maquina,
m.nome AS maquina,
m.tag,
IFNULL(AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS mttr
FROM ordem_servico o
JOIN maquina m ON o.id_maquina = m.id_maquina
WHERE ${where}
GROUP BY m.id_maquina, m.nome, m.tag
ORDER BY m.id_maquina
`,
      params
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao calcular MTTR por máquina" });
  }
};

// -------------------------------
// MTBF GERAL (AJUSTADO PARA MÊS OU PERÍODO FILTRADO)
// -------------------------------
export async function getMTBFGeral(req: Request, res: Response) {
  try {
    let { dataInicial, dataFinal, idSetor } = req.query;

    // Variáveis para coletar os parâmetros de cada subquery separadamente
    const paramsIndisponivel: any[] = [];
    const paramsFalhas: any[] = [];
    const totalMinutes = getTotalMinutesPeriod(
      dataInicial as string | undefined,
      dataFinal as string | undefined
    );
    const totalHours = totalMinutes / 60;

    // WHERE para tempo de indisponibilidade (Down Time)
    let whereIndisponivel =
      "WHERE o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL";
    let whereFalhas = "WHERE o.data_termino IS NOT NULL";

    // Construção dos WHEREs e coleta dos parâmetros
    if (dataInicial) {
      whereIndisponivel += " AND o.data_inicio >= ?";
      whereFalhas += " AND o.data_termino >= ?";
      paramsIndisponivel.push(dataInicial);
      paramsFalhas.push(dataInicial);
    }
    if (dataFinal) {
      whereIndisponivel += " AND o.data_termino <= ?";
      whereFalhas += " AND o.data_termino <= ?";
      paramsIndisponivel.push(dataFinal);
      paramsFalhas.push(dataFinal);
    }
    if (idSetor) {
      whereIndisponivel += " AND m.id_setor = ?";
      whereFalhas += " AND m.id_setor = ?";
      paramsIndisponivel.push(idSetor);
      paramsFalhas.push(idSetor);
    }

    // A ordem dos parâmetros é crucial: primeiro todos de 'paramsIndisponivel', depois todos de 'paramsFalhas'.
    const params = [...paramsIndisponivel, ...paramsFalhas];

    // Query para obter total de horas de downtime e total de falhas
    const queryStats = `
      SELECT
        (SELECT IFNULL(SUM(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0)
         FROM ordem_servico o
         JOIN maquina m ON m.id_maquina = o.id_maquina
         ${whereIndisponivel}) AS totalDownTimeHours,
        (SELECT COUNT(*)
         FROM ordem_servico o
         JOIN maquina m ON m.id_maquina = o.id_maquina
         ${whereFalhas}) AS totalFailures
    `;

    const [stats]: any = await db.query(queryStats, params);

    const totalDownTimeHours = stats[0]?.totalDownTimeHours ?? 0;
    const totalFailures = stats[0]?.totalFailures ?? 0;

    if (totalFailures === 0) return res.json({ mtbf: 0 });

    // Tempo operacional = total do período - downtime
    const totalUpTimeHours = Math.max(0, totalHours - totalDownTimeHours);

    // MTBF em horas
    const mtbf = totalUpTimeHours / totalFailures;

    res.json({ mtbf: Number(mtbf.toFixed(2)) });
  } catch (err) {
    console.error("Erro no MTBF:", err);
    res.status(500).json({ erro: "Erro ao calcular MTBF" });
  }
}
// -------------------------------
// MTBF POR MÁQUINA
// -------------------------------
export const getMTBFPorMaquina = async (req: Request, res: Response) => {
  // manter sua versão atual
};
export async function getDisponibilidadeGeral(req: Request, res: Response) {
  try {
    const { dataInicial, dataFinal, idSetor } = req.query;

    // 1) Determinar período do filtro ou mês atual
    const hoje = new Date();
    const inicioMes = dataInicial
      ? new Date(dataInicial as string)
      : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = dataFinal
      ? new Date(dataFinal as string)
      : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    // 2) Buscar máquinas com disponibilidade_mes
    let whereMaquina = "WHERE disponibilidade_mes IS NOT NULL";
    const paramsMaquina: any[] = [];

    if (idSetor) {
      whereMaquina += " AND id_setor = ?";
      paramsMaquina.push(idSetor);
    }

    const [maquinas]: any = await db.query(
      `SELECT id_maquina, disponibilidade_mes FROM maquina ${whereMaquina}`,
      paramsMaquina
    );

    if (maquinas.length === 0) return res.json({ disponibilidade: 0 });

    const disponibilidades: number[] = [];

    for (const maquina of maquinas) {
      // 3) Buscar downtime da máquina dentro do período
      const [rows]: any = await db.query(
        `
        SELECT 
          o.data_inicio, o.data_termino
        FROM ordem_servico o
        WHERE o.id_maquina = ?
          AND o.data_inicio IS NOT NULL
          AND (o.data_termino IS NULL OR o.data_termino IS NOT NULL)
      `,
        [maquina.id_maquina]
      );

      let tempoParadoMinutos = 0;

      for (const os of rows) {
        const inicioOS = new Date(os.data_inicio);
        const terminoOS = os.data_termino ? new Date(os.data_termino) : fimMes;

        // Calcula apenas o tempo que caiu dentro do período
        const inicio = inicioOS < inicioMes ? inicioMes : inicioOS;
        const fim = terminoOS > fimMes ? fimMes : terminoOS;

        const diff = (fim.getTime() - inicio.getTime()) / (1000 * 60); // minutos

        if (diff > 0) tempoParadoMinutos += diff;
      }

      // 4) Disponibilidade da máquina
      const totalDisponibilidadeMinutos = maquina.disponibilidade_mes * 60;

      if (totalDisponibilidadeMinutos <= 0) continue;

      const disp =
        ((totalDisponibilidadeMinutos - tempoParadoMinutos) /
          totalDisponibilidadeMinutos) *
        100;

      disponibilidades.push(Math.max(0, Math.min(disp, 100)));
    }

    if (disponibilidades.length === 0) return res.json({ disponibilidade: 0 });

    // 5) Média das disponibilidades
    const media =
      disponibilidades.reduce((a, b) => a + b, 0) / disponibilidades.length;

    res.json({ disponibilidade: Number(media.toFixed(2)) });
  } catch (err) {
    console.error("Erro ao calcular disponibilidade:", err);
    res.status(500).json({ erro: "Erro ao calcular disponibilidade" });
  }
}

// -------------------------------
// OS CONCLUÍDAS GERAL (CORRETO)
// -------------------------------
export async function getOsConcluidasGeral(req: Request, res: Response) {
  try {
    const { dataInicial, dataFinal, idSetor } = req.query;
    const params: any[] = [];
    let where = "WHERE o.data_termino IS NOT NULL";

    if (dataInicial) {
      where += " AND o.data_termino >= ?";
      params.push(dataInicial);
    }
    if (dataFinal) {
      where += " AND o.data_termino <= ?";
      params.push(dataFinal);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
SELECT COUNT(*) AS totalOsConcluidas
FROM ordem_servico o
JOIN maquina m ON m.id_maquina = o.id_maquina
${where}
`;

    const [rows]: any = await db.query(query, params);
    res.json({ totalOsConcluidas: rows[0]?.totalOsConcluidas ?? 0 });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar OS concluídas" });
  }
}

// -------------------------------------------
// CUSTO TOTAL DE MANUTENÇÃO (NOVO RELATÓRIO)
// -------------------------------------------
export async function getCustoTotalGeral(req: Request, res: Response) {
  try {
    const { dataInicial, dataFinal, idSetor } = req.query;
    const params: any[] = [];

    // Somar todos os custos das O.S. concluídas
    let where = `WHERE o.data_termino IS NOT NULL AND o.custo IS NOT NULL`;

    if (dataInicial) {
      where += " AND o.data_termino >= ?";
      params.push(dataInicial);
    }
    if (dataFinal) {
      where += " AND o.data_termino <= ?";
      params.push(dataFinal);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
 SELECT IFNULL(SUM(o.custo), 0) AS custoTotal
 FROM ordem_servico o
 JOIN maquina m ON m.id_maquina = o.id_maquina
 ${where}
 `;

    const [rows]: any = await db.query(query, params);

    res.json({
      custoTotal: rows[0]?.custoTotal ?? 0,
    });
  } catch (err) {
    console.error("Erro ao calcular Custo Total:", err);
    res.status(500).json({ erro: "Erro ao calcular Custo Total" });
  }
}

// -------------------------------
// MTTI GERAL (Mean Time To Initial Response)
// -------------------------------
export async function getMTTAGeral(req: Request, res: Response) {
  try {
    const { dataInicial, dataFinal, idSetor } = req.query;
    const params: any[] = [];
    // Seleciona somente OS que já iniciaram (data_inicio IS NOT NULL)
    let where = "WHERE o.data_inicio IS NOT NULL";

    if (dataInicial) {
      where += " AND o.data_abertura >= ?";
      params.push(dataInicial);
    }
    if (dataFinal) {
      where += " AND o.data_inicio <= ?";
      params.push(dataFinal);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
 SELECT 
 AVG(TIMESTAMPDIFF(HOUR, o.data_abertura, o.data_inicio)) AS mttiMinutos
 FROM ordem_servico o
 JOIN maquina m ON m.id_maquina = o.id_maquina
 ${where}
 `;

    const [rows]: any = await db.query(query, params);

    // Converte a média de minutos para horas (para padronizar com MTTR/MTBF)
    const mttiHoras = (rows[0]?.mttiMinutos ?? 0) / 60;

    res.json({ mtti: Number(mttiHoras.toFixed(2)) });
  } catch (err) {
    console.error("Erro ao calcular MTTI:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTI" });
  }
}

// -------------------------------------------
// BACKLOG GERAL (Contagem total de OS pendentes) - NOVO ENDPOINT
// -------------------------------------------
export async function getBacklogOsGeral(req: Request, res: Response) {
  try {
    const { idSetor } = req.query;
    const params: any[] = [];
    // Filtra por OS que ainda não foram concluídas (data_termino é NULL)
    let where = "WHERE o.data_termino IS NULL";

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
            SELECT 
                COUNT(*) AS totalBacklog
            FROM ordem_servico o
            JOIN maquina m ON m.id_maquina = o.id_maquina
            ${where}
        `;

    const [rows]: any = await db.query(query, params);

    res.json({ totalBacklog: rows[0]?.totalBacklog ?? 0 });
  } catch (err) {
    console.error("Erro ao buscar Backlog Geral:", err);
    res.status(500).json({ erro: "Erro ao buscar Backlog Geral" });
  }
}

// -------------------------------------------
// BACKLOG DETALHADO (Lista de OS pendentes) - CORRIGIDO SEM USUÁRIO
// -------------------------------------------

export async function getBacklogOsDetalhado(req: Request, res: Response) {
  try {
    const { idSetor } = req.query;
    const params: any[] = [];

    // Filtra por OS que ainda não foram concluídas (data_termino é NULL)
    let where = "WHERE o.data_termino IS NULL";
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
            SELECT 
                o.id_ord_serv,
                o.descricao,
                o.data_abertura,
                DATEDIFF(NOW(), o.data_abertura) AS idade_dias,
                m.nome AS nome_maquina,
                m.tag AS tag_maquina,
                s.setor AS nome_setor,
                o.id_estado
            FROM ordem_servico o
            JOIN maquina m ON m.id_maquina = o.id_maquina
            JOIN setor s ON m.id_setor = s.id_setor
            ${where}
            ORDER BY idade_dias DESC, o.data_abertura ASC
        `;

    const [rows]: any = await db.query(query, params);

    // Mapear id_estado para status legível
    const estadoMap: Record<number, string> = {
      1: "Aberta",
      2: "Em Andamento",
      3: "Finalizado",
    };

    const backlogDetalhadoComStatus = rows.map((row: any) => ({
      ...row,
      status: estadoMap[row.id_estado] || "Desconhecido",
    }));

    res.json(backlogDetalhadoComStatus);
  } catch (err) {
    console.error("Erro ao buscar Backlog Detalhado:", err);
    res.status(500).json({ erro: "Erro ao buscar Backlog Detalhado" });
  }
}

// -------------------------------
// DASHBOARD POR MÁQUINA
// -------------------------------
export const getDashboardMaquina = async (req: Request, res: Response) => {
  // manter sua versão atual
};
