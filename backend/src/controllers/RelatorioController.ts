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
// Assumindo que 'db' é uma conexão de banco de dados global/importada

// Supondo que 'db' seja sua conexão com o banco de dados

export async function getMTTRGeral(req: Request, res: Response) {
  try {
    let { dataInicial, dataFinal, idSetor } = req.query as {
      dataInicial?: string;
      dataFinal?: string;
      idSetor?: string;
    };

    const agora = new Date();

    // --- 1. CONFIGURAÇÃO DE DATAS ---
    if (!dataInicial) dataInicial = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2,'0')}-01`;
    if (!dataFinal) {
      const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
      dataFinal = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2,'0')}-${String(ultimoDia.getDate()).padStart(2,'0')}`;
    }

    // Cria datas completas no horário local
    const inicioFiltro = new Date(`${dataInicial}T00:00:00`);
    const fimFiltro = new Date(`${dataFinal}T23:59:59.999`);

    const params: any[] = [inicioFiltro, fimFiltro];
    let where =
      "WHERE o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL AND o.data_termino >= ? AND o.data_inicio <= ?";

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // --- 2. CONSULTA SQL ---
    const query = `
      SELECT o.id_ord_serv, m.nome AS nome_maquina, o.data_inicio, o.data_termino
      FROM ordem_servico o
      JOIN maquina m ON o.id_maquina = m.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    if (!rows.length) return res.json({ mttr: 0 });

    let totalHoras = 0;
    let countOS = rows.length; // Contamos todas as OS retornadas pelo filtro

    // --- 3. CÁLCULO DA INTERSEÇÃO ---
    for (const os of rows) {
      const inicioOS = new Date(os.data_inicio);
      const terminoOS = new Date(os.data_termino);

      // Calcula apenas o tempo que cruza o período do filtro
      const inicioConsiderado = inicioOS > inicioFiltro ? inicioOS : inicioFiltro;
      const terminoConsiderado = terminoOS < fimFiltro ? terminoOS : fimFiltro;

      const diffMs = terminoConsiderado.getTime() - inicioConsiderado.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      totalHoras += diffHoras;

      // DEBUG opcional
      console.log(`OS ID: ${os.id_ord_serv} | Máquina: ${os.nome_maquina}`);
      console.log(`  Período: ${inicioConsiderado.toISOString()} -> ${terminoConsiderado.toISOString()}`);
      console.log(`  Duração: ${diffHoras.toFixed(2)}h`);
    }

    const mttr = totalHoras / countOS;

    console.log(`Total Horas: ${totalHoras.toFixed(2)} | Contagem OS: ${countOS} | MTTR: ${mttr.toFixed(2)}h`);

    res.json({ mttr: Number(mttr.toFixed(2)) });
  } catch (err) {
    console.error("Erro ao calcular MTTR Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTR Geral" });
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

    // Filtro principal: só OS que já começaram (data_inicio não nula)
    let where = "WHERE o.data_inicio IS NOT NULL AND o.data_abertura IS NOT NULL";

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
        COUNT(*) AS total_os,
        AVG(TIMESTAMPDIFF(MINUTE, o.data_abertura, o.data_inicio)) AS mtta_minutos
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    const totalOs = rows[0]?.total_os ?? 0;
    const mttaMinutosDoBanco = rows[0]?.mtta_minutos ?? 0;

    // Se não houver OS válidas, retorna 0
    if (totalOs === 0 || mttaMinutosDoBanco === null) {
      return res.json({ totalOs: 0, mttaMinutos: 0, mttaHoras: 0 });
    }

    // Garantir número válido
    const mttaMinutos = parseFloat(mttaMinutosDoBanco) || 0;
    const mttaHoras = mttaMinutos / 60;

    res.json({
      totalOs,
      mttaMinutos: Number(mttaMinutos.toFixed(0)),
      mttaHoras: Number(mttaHoras.toFixed(2)),
    });
  } catch (err) {
    console.error("Erro ao calcular MTTA Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTA Geral" });
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

// -------------------------------------------
// MTTR Anual (Agrupado por Mês)
export async function getMTTRAnual(req: Request, res: Response) {
  try {
    // O frontend enviará o ano e, opcionalmente, o idSetor
    const { ano, idSetor } = req.query;
    const params: any[] = [];
    let where = "WHERE o.data_termino IS NOT NULL";

    // 1. Filtro por Ano
    const targetYear = Number(ano) || new Date().getFullYear();
    where += " AND YEAR(o.data_termino) = ?";
    params.push(targetYear);

    // 2. Filtro por Setor
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // 3. Query principal (só trará meses com dados)
    const query = `
      SELECT 
        MONTH(o.data_termino) AS mes_num,
        IFNULL(AVG(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS mttr
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY mes_num
      ORDER BY mes_num ASC
    `;

    const [rows]: any = await db.query(query, params);

    // 4. PÓS-PROCESSAMENTO: Cria estrutura de 12 meses e mescla os resultados do DB
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      mttr: 0.0,
    }));

    // Mescla os resultados do banco de dados na estrutura anual
    const finalData = fullYearData.map(monthData => {
      const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);
      if (dbRow) {
        // CORREÇÃO: parseFloat garante número antes de toFixed
        const mttrValue = parseFloat(dbRow.mttr);

        return {
          ...monthData,
          mttr: Number(mttrValue.toFixed(2)) || 0.0,
        };
      }
      return monthData;
    });

    res.json(finalData);
  } catch (err) {
    console.error("Erro ao buscar MTTR Anual:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTR Anual" });
  }
}

export async function getMTBFAnual(req: Request, res: Response) {
  try {
    const { ano, idSetor } = req.query;
    const params: any[] = [];
    let where = "WHERE o.data_termino IS NOT NULL";

    const targetYear = Number(ano) || new Date().getFullYear();
    where += " AND YEAR(o.data_termino) = ?";
    params.push(targetYear);

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // 1. Query para obter o tempo de inatividade (downtime) e a contagem de falhas (failures) por mês.
    const query = `
      SELECT 
        MONTH(o.data_termino) AS mes_num,
        -- Soma do tempo de inatividade no mês (em horas)
        IFNULL(SUM(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS downtime_hours,
        -- Contagem total de ordens de serviço concluídas (falhas) no mês
        COUNT(*) AS failure_count
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY mes_num
      ORDER BY mes_num ASC
    `;

    const [rows]: any = await db.query(query, params);

    // 2. PÓS-PROCESSAMENTO: Cria estrutura de 12 meses
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => {
      // Calcula o número total de dias no mês para o ano alvo
      const totalDaysInMonth = new Date(targetYear, i + 1, 0).getDate();
      const totalAvailableHours = totalDaysInMonth * 24;

      return {
        mes_num: i + 1,
        periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
        totalAvailableHours: totalAvailableHours,
        mtbf: 0.0,
      };
    });

    // 3. Mescla os resultados e calcula o MTBF
    const finalData = fullYearData.map(monthData => {
      const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);
      
      if (dbRow) {
        const downtimeHours = parseFloat(dbRow.downtime_hours);
        const failureCount = parseInt(dbRow.failure_count, 10);

        let mtbf = 0.0;

        if (failureCount > 0) {
          // Tempo operacional (Up Time) = Total disponível - Downtime
          const upTimeHours = Math.max(0, monthData.totalAvailableHours - downtimeHours);
          
          // MTBF = Up Time / Número de Falhas
          mtbf = upTimeHours / failureCount;
        }

        return {
          ...monthData,
          mtbf: Number(mtbf.toFixed(2)),
        };
      }

      return monthData;
    });

    res.json(finalData);
  } catch (err) {
    console.error("Erro ao buscar MTBF Anual:", err);
    res.status(500).json({ erro: "Erro ao calcular MTBF Anual" });
  }
}

// -------------------------------------------
// MTTA Anual (Mean Time To Acknowledge) por mês
export async function getMTTAAnual(req: Request, res: Response) {
  try {
    const { ano, idSetor } = req.query;
    const params: any[] = [];
    let where = "WHERE o.data_inicio IS NOT NULL AND o.data_termino IS NOT NULL";

    const targetYear = Number(ano) || new Date().getFullYear();
    where += " AND YEAR(o.data_termino) = ?";
    params.push(targetYear);

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // Query retorna média em MINUTOS
    const query = `
      SELECT 
        MONTH(o.data_termino) AS mes_num,
        IFNULL(AVG(TIMESTAMPDIFF(MINUTE, o.data_abertura, o.data_inicio)), 0) AS mtta_minutos
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY mes_num
      ORDER BY mes_num ASC
    `;

    const [rows]: any = await db.query(query, params);

    // Preenche todos os 12 meses
    const monthNames = [
      "Jan","Fev","Mar","Abr","Mai","Jun",
      "Jul","Ago","Set","Out","Nov","Dez"
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      mtta: 0,
    }));

    const finalData = fullYearData.map(monthData => {
      const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);
      return {
        ...monthData,
        mtta: dbRow ? parseFloat(dbRow.mtta_minutos) : 0
      };
    });

    res.json(finalData);
  } catch (err) {
    console.error("Erro ao buscar MTTA Anual:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTA Anual" });
  }
}
