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
    let { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const agora = new Date();

    // Converte os parâmetros de forma segura
    const m = mes && !isNaN(Number(mes)) ? Number(mes) : agora.getMonth() + 1;
    const y = ano && !isNaN(Number(ano)) ? Number(ano) : agora.getFullYear();

    const mesValido = Math.min(Math.max(m, 1), 12);

    // 📅 Define início e fim do mês com base NO TÉRMINO da OS
    const dataInicial = new Date(y, mesValido - 1, 1, 0, 0, 0);
    const dataFinal = new Date(y, mesValido, 0, 23, 59, 59, 999);

    const params: any[] = [dataInicial, dataFinal];

    // 📌 Agora filtramos SOMENTE POR DATA DE TÉRMINO
    let where = `
      WHERE o.data_inicio IS NOT NULL
        AND o.data_termino IS NOT NULL
        AND o.data_termino BETWEEN ? AND ?
    `;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // 📌 Calculo do MTTR direto no banco usando AVG()
    const query = `
      SELECT 
        COUNT(*) AS total_os,
        AVG(TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_termino)) AS mttr_minutos
      FROM ordem_servico o
      JOIN maquina m ON o.id_maquina = m.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    const totalOs = rows[0]?.total_os ?? 0;
    const mediaMinutos = rows[0]?.mttr_minutos ?? 0;

    if (totalOs === 0) {
      return res.json({ mttr: 0 });
    }

    // Converte minutos para horas
    const mttrHoras = mediaMinutos / 60;

    res.json({ mttr: Number(mttrHoras.toFixed(2)) });

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
// -------------------------------
// MTBF GERAL (AJUSTADO E CORRIGIDO)
// -------------------------------

export async function getMTBFGeral(req: Request, res: Response) {
 try {
 let { mes, ano, idSetor } = req.query as { mes?: string; ano?: string; idSetor?: string; };

 const hoje = new Date();
 const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();
 const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;

 if (mesNum < 1 || mesNum > 12) {
 return res.status(400).json({ erro: "Mês inválido." });
 }

const mesIndex = mesNum - 1;
 const totalDaysInMonth = new Date(anoNum, mesIndex + 1, 0).getDate();

// 1. Período de Filtro: Limites do MÊS DE INTERESSE (pela data de TÉRMINO)
const inicioFiltro = new Date(anoNum, mesIndex, 1, 0, 0, 0);
 const fimFiltro = new Date(anoNum, mesIndex + 1, 0, 23, 59, 59, 999);

 const params: any[] = [inicioFiltro, fimFiltro];

 let where = `
 WHERE o.data_inicio IS NOT NULL
 AND o.data_termino IS NOT NULL
AND o.data_termino BETWEEN ? AND ?
 `;
 if (idSetor) {
where += " AND m.id_setor = ?";
 params.push(idSetor);
 }

 // 2. Query: Busca Contagem de Falhas, Downtime Total e Contagem de Máquinas Afetadas
 const query = `
 SELECT 
 COUNT(o.id_ord_serv) AS failure_count,
 IFNULL(SUM(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS downtime_hours,
 COUNT(DISTINCT m.id_maquina) AS num_maquinas_afetadas
 FROM ordem_servico o
 JOIN maquina m ON o.id_maquina = m.id_maquina
 ${where}
 `;

 const [rows]: any = await db.query(query, params);

 const failureCount = parseInt(rows[0]?.failure_count || 0, 10);
 const downtimeHours = parseFloat(rows[0]?.downtime_hours || 0);
 const numMaquinasAfetadas = parseInt(rows[0]?.num_maquinas_afetadas || 0, 10);
    
    // Se não houver máquinas afetadas, assumimos 1 para o cálculo base do Tempo Disponível, 
    // mas o cálculo só é relevante se houver falhas.
    const numMaquinasParaUptime = numMaquinasAfetadas > 0 ? numMaquinasAfetadas : 1;
    
    // Tempo Máximo Disponível: Dias * 24h * Nº de Máquinas no escopo
 const totalAvailableHours = totalDaysInMonth * 24 * numMaquinasParaUptime;

 // Up Time = Total Disponível - Downtime
 const upTimeHours = Math.max(0, totalAvailableHours - downtimeHours);

 // --- Retorno ---
 if (failureCount <= 0) {
 return res.status(200).json({
 mtbf: 0, // 🎯 CORREÇÃO: Retorna 0 para MTBF em vez do totalAvailableHours
totalHorasOperacionais: Number(upTimeHours.toFixed(2)), // Retorna o Up Time, mesmo que failureCount seja 0
countFalhas: 0,
 aviso: "Nenhuma falha registrada. MTBF zerado.",
 });
 }

 const mtbf = upTimeHours / failureCount;

res.json({
mtbf: Number(mtbf.toFixed(2)),
 totalHorasOperacionais: Number(upTimeHours.toFixed(2)),
 countFalhas: failureCount,
 });

 } catch (err) {
 console.error("Erro ao calcular MTBF Geral:", err);
 res.status(500).json({ erro: "Erro ao calcular MTBF Geral" });
 }
}


// -------------------------------------------
// CUSTO TOTAL DE MANUTENÇÃO (NOVO RELATÓRIO)
// -------------------------------------------
export async function getCustoTotalGeral(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido" });
    }

    // Datas de início e fim do mês
    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59);

    const params: any[] = [dataInicial, dataFinal];

    let where = `
      WHERE o.data_termino IS NOT NULL
      AND o.custo IS NOT NULL
      AND o.data_termino BETWEEN ? AND ?
    `;

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
    const { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido" });
    }

    const inicioMes = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const fimMes = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const params: any[] = [inicioMes, fimMes];

    let where = `
      WHERE o.data_inicio IS NOT NULL
      AND o.data_abertura IS NOT NULL
      AND o.data_abertura BETWEEN ? AND ?
    `;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // Query para MTTA
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

    const mttaMinutos = parseFloat(mttaMinutosDoBanco) || 0;
    const mttaHoras = mttaMinutos / 60;


    res.json({
      totalOs,
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



// Assumindo que 'db' é a conexão do MySQL já importada



export async function getMTTRAnual(req: Request, res: Response) {
  try {
    const { ano, idSetor } = req.query;
    const targetYear = Number(ano) || new Date().getFullYear();
    const params: any[] = [];

    // 🔍 Filtro principal: somente OS concluídas no ano especificado
    let where = `
        WHERE o.data_inicio IS NOT NULL
        AND o.data_termino IS NOT NULL
        AND YEAR(o.data_termino) = ?
    `;
    params.push(targetYear);

    // 🔍 Filtro por setor
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // 🔍 Busca duração total (em minutos) e data de término
    const query = `
      SELECT 
        o.data_termino, 
        TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_termino) AS duracao_minutos
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    // Estrutura base dos 12 meses
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const monthData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      somaDuracaoMinutos: 0,
      countOS: 0
    }));

    // Distribui OS para o mês do término
    for (const os of rows) {
      const dataTerminoOS = new Date(os.data_termino);
      const mesIndex = dataTerminoOS.getMonth(); // 0–11
      const duracao = os.duracao_minutos;

      if (duracao > 0 && mesIndex >= 0 && mesIndex < 12) {
        monthData[mesIndex]!.somaDuracaoMinutos += duracao;
        monthData[mesIndex]!.countOS += 1;
      }
    }

    // Calcula MTTR mensal (em horas)
    const finalData = monthData.map(month => {
      let mttrHoras = 0;

      if (month.countOS > 0) {
        const mttrMinutos = month.somaDuracaoMinutos / month.countOS;
        mttrHoras = mttrMinutos / 60;
      }

      return {
        mes_num: month.mes_num,
        periodo: month.periodo,
        mttr: Number(mttrHoras.toFixed(2)),
      };
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

 const targetYear = Number(ano) || new Date().getFullYear();
 
    let where = "WHERE o.data_termino IS NOT NULL";
 where += " AND YEAR(o.data_termino) = ?";
 params.push(targetYear);

 if (idSetor) {
 where += " AND m.id_setor = ?";
 params.push(idSetor);
 }

 // 1. Query: Busca Downtime, Contagem de Falhas E Contagem de Máquinas Afetadas por Mês.
 const query = `
 SELECT 
 MONTH(o.data_termino) AS mes_num,
 IFNULL(SUM(TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_termino)), 0) AS downtime_hours,
 COUNT(*) AS failure_count,
        COUNT(DISTINCT m.id_maquina) AS num_maquinas_afetadas
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

// Estrutura auxiliar para calcular o MTBF
 const fullYearData = Array.from({ length: 12 }, (_, i) => {
const totalDaysInMonth = new Date(targetYear, i + 1, 0).getDate();
 return {
 mes_num: i + 1,
 periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
 totalDaysInMonth: totalDaysInMonth, 
mtbf: 0.0,
 };
 });

 // 3. Mescla os resultados e calcula o MTBF
const finalData = fullYearData.map(monthData => {
 const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);

 if (dbRow) {
 const downtimeHours = parseFloat(dbRow.downtime_hours);
 const failureCount = parseInt(dbRow.failure_count, 10);
        const numMaquinas = parseInt(dbRow.num_maquinas_afetadas, 10);
        
        // 🎯 CÁLCULO CORRETO DE UP TIME: Total de horas disponíveis = Dias * 24h * Nº de Máquinas
        const totalAvailableHours = monthData.totalDaysInMonth * 24 * numMaquinas;

 let mtbf = 0.0;

 if (failureCount > 0) {
 // Up Time (Horas Operacionais) = Total Disponível - Downtime
 const upTimeHours = Math.max(0, totalAvailableHours - downtimeHours);

 // MTBF = Up Time / Número de Falhas
 mtbf = upTimeHours / failureCount;
 }

 return {
 ...monthData,
 mtbf: Number(mtbf.toFixed(2)),
 };
 }

return {
            ...monthData,
            mtbf: 0.0,
        };
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
 
    // Garante que as datas de cálculo existam
  let where = "WHERE o.data_inicio IS NOT NULL AND o.data_abertura IS NOT NULL"; 

 const targetYear = Number(ano) || new Date().getFullYear();
    // 🎯 CORREÇÃO: Filtrar pelo ano de ABERTURA
 where += " AND YEAR(o.data_abertura) = ?";
 params.push(targetYear);

 if (idSetor) {
 where += " AND m.id_setor = ?";
 params.push(idSetor);
 }

 // Query retorna média em MINUTOS, agrupada pelo mês de ABERTURA
const query = `
  SELECT 
    MONTH(o.data_abertura) AS mes_num, /* Agrupar pelo mês de ABERTURA */
    IFNULL(AVG(TIMESTAMPDIFF(MINUTE, o.data_abertura, o.data_inicio)), 0) AS mtta_minutos
  FROM ordem_servico o
  JOIN maquina m ON m.id_maquina = o.id_maquina
  ${where}
  GROUP BY mes_num
  ORDER BY mes_num ASC
`;


const [rows]: any = await db.query(query, params);

 // ... (O restante da lógica de preenchimento dos 12 meses está correto)
 const monthNames = [
"Jan","Fev","Mar","Abr","Mai","Jun",
 "Jul","Ago","Set","Out","Nov","Dez"
];

 const fullYearData = Array.from({ length: 12 }, (_, i) => ({
  mes_num: i + 1,
  periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
  mttaHoras: 0, // inicializa em 0 horas
}));

const finalData = fullYearData.map(monthData => {
  const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);

  // Converte o MTTA do banco (em minutos) para horas
  const mttaMinutos = dbRow ? parseFloat(dbRow.mtta_minutos) : 0;
  const mttaHoras = mttaMinutos / 60;

  return {
    ...monthData,
    mttaHoras: Number(mttaHoras.toFixed(2)), // retorna em horas
  };
});

res.json(finalData);

 } catch (err) {
 console.error("Erro ao buscar MTTA Anual:", err);
 res.status(500).json({ erro: "Erro ao calcular MTTA Anual" });
 }
}


export async function getRankingMaquinasOrdens(req: Request, res: Response) {
  try {
    let { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido." });
    }

    // Datas do mês
    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const params: any[] = [dataInicial, dataFinal];
    let where = `WHERE o.data_abertura BETWEEN ? AND ?`;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      SELECT 
        m.nome AS maquina,
        COUNT(o.id_ord_serv) AS total_ordens
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY m.id_maquina, m.nome
      ORDER BY total_ordens DESC
      LIMIT 5
    `;

    const [rows]: any = await db.query(query, params);

    res.json(rows); // retorna todas as máquinas ordenadas pelo total de ordens

  } catch (err) {
    console.error("Erro ao calcular ranking de máquinas:", err);
    res.status(500).json({ erro: "Erro ao buscar ranking de máquinas" });
  }
}

export async function getRankingMaquinasCusto(req: Request, res: Response) {
  try {
    let { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido." });
    }

    // Define datas de início e fim do mês
    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const params: any[] = [dataInicial, dataFinal];
    let where = `WHERE o.data_termino IS NOT NULL AND o.custo IS NOT NULL AND o.data_termino BETWEEN ? AND ?`;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      SELECT 
        m.nome AS maquina,
        SUM(o.custo) AS total_custo
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY m.id_maquina, m.nome
      ORDER BY total_custo DESC
      LIMIT 5
    `;

    const [rows]: any = await db.query(query, params);

    // Garante que o custo venha como número
   const ranking = rows.map((row: any) => ({
  maquina: row.maquina,
  totalCusto: parseFloat(row.total_custo) || 0
}));


    res.json(ranking);
  } catch (err) {
    console.error("Erro ao calcular ranking de máquinas por custo:", err);
    res.status(500).json({ erro: "Erro ao buscar ranking de máquinas por custo" });
  }
}