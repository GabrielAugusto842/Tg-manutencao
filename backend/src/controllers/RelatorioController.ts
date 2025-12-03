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

    // ⚡ CONVERSÃO SEGURA DE PARÂMETROS
    const m = mes && !isNaN(Number(mes)) ? Number(mes) : agora.getMonth() + 1;
    const y = ano && !isNaN(Number(ano)) ? Number(ano) : agora.getFullYear();

    // Garantir que o mês esteja entre 1 e 12
    const mesValido = Math.min(Math.max(m, 1), 12);

    // 📅 Datas do período (início e fim do mês)
    const dataInicial = new Date(y, mesValido - 1, 1, 0, 0, 0);
    const dataFinal = new Date(y, mesValido, 0, 23, 59, 59, 999);

    console.log(`--- DEBUG MTTR ---`);
    console.log(`Parâmetros Recebidos: mes=${mes}, ano=${ano}, idSetor=${idSetor}`);
    console.log(`Período de Cálculo: ${dataInicial.toISOString()} ATÉ ${dataFinal.toISOString()}`);
    console.log(`------------------`);

    // Parâmetros para a query
    const params: any[] = [dataInicial, dataFinal];

    let where = `
      WHERE o.data_inicio IS NOT NULL
        AND o.data_termino IS NOT NULL
        AND o.data_termino >= ?
        AND o.data_inicio <= ?
    `;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      SELECT 
        o.id_ord_serv,
        m.nome AS nome_maquina,
        o.data_inicio,
        o.data_termino
      FROM ordem_servico o
      JOIN maquina m ON o.id_maquina = m.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    if (!rows.length) {
      console.log("Nenhuma OS encontrada para o período/setor.");
      return res.json({ mttr: 0 });
    }

    let totalHoras = 0;
    const countOS = rows.length;

    for (const os of rows) {
      const inicioOS = new Date(os.data_inicio);
      const terminoOS = new Date(os.data_termino);

      const inicioConsiderado = inicioOS > dataInicial ? inicioOS : dataInicial;
      const terminoConsiderado = terminoOS < dataFinal ? terminoOS : dataFinal;

      const diffMs = terminoConsiderado.getTime() - inicioConsiderado.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      totalHoras += diffHoras;
    }

    const mttr = totalHoras / countOS;

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
// -------------------------------
// MTBF GERAL (AJUSTADO E CORRIGIDO)
// -------------------------------

export async function getMTBFGeral(req: Request, res: Response) {
  try {
    let { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const anoNum = ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();
    const mesNum = mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido." });
    }

    const mesIndex = mesNum - 1;

    // 1. Período de Filtro: Limites do MÊS DE INTERESSE
    const inicioFiltro = new Date(anoNum, mesIndex, 1, 0, 0, 0);
    const fimFiltro = new Date(anoNum, mesIndex + 1, 0, 23, 59, 59, 999);

    // 2. Período de Query (Escopo Expandido): Inclui o mês anterior
    const inicioQuery = new Date(anoNum, mesIndex - 1, 1, 0, 0, 0);

    let where = `
      WHERE o.data_inicio IS NOT NULL
        AND o.data_termino IS NOT NULL
        AND o.data_termino >= ? 
        AND o.data_inicio <= ?
    `;
    const params: any[] = [inicioQuery, fimFiltro];

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      SELECT 
        o.id_ord_serv,
        o.id_maquina,
        m.nome AS maquina,
        o.data_inicio,
        o.data_termino
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      ORDER BY o.id_maquina, o.data_inicio
    `;

    const [rows]: any = await db.query(query, params);

    // --- Ajuste para caso de zero falhas ---
    const diffTempoTotalMes = fimFiltro.getTime() - inicioFiltro.getTime();
    const horasMaximasPorMaquina = diffTempoTotalMes / (1000 * 60 * 60);
    const numMaquinas = new Set(rows.map((os: any) => os.id_maquina)).size;
    const uptimeMaximoTeorico = horasMaximasPorMaquina * numMaquinas;
    
    if (!rows.length) {
      return res.json({ 
        mtbf: 0, 
        totalHorasOperacionais: Number(uptimeMaximoTeorico.toFixed(2)), 
        countFalhas: 0, 
        aviso: "Nenhuma falha registrada. Retornando Uptime máximo teórico." 
      });
    }

    // Agrupar OS por máquina
    const maquinas: Record<number, any[]> = {};
    for (const os of rows) {
      const id = os.id_maquina;
      if (id != null) {
        maquinas[id] = maquinas[id] ?? [];
        os.data_inicio = new Date(os.data_inicio);
        os.data_termino = new Date(os.data_termino);
        maquinas[id].push(os);
      }
    }

    let totalHorasOperacionais = 0;
    const falhasFinalizadasNoMes: Set<number> = new Set(); 

    for (const idMaquina in maquinas) {
      const osMaquina = maquinas[idMaquina];
      if (!osMaquina || osMaquina.length === 0) continue;

      // Contagem de falhas no mês de filtro
      for (const os of osMaquina) {
        if (os.data_termino >= inicioFiltro && os.data_termino <= fimFiltro) {
          falhasFinalizadasNoMes.add(os.id_ord_serv);
        }
      }
      
      // Cálculo do TBF
      for (let i = 0; i < osMaquina.length; i++) {
        let terminoAnterior: Date;
        let inicioProxima: Date;

        if (i === 0) {
          // TBF inicial: última OS concluída no mês anterior ou início do filtro
          const osAnterioresConcluidas = rows.filter((os: any) => 
            os.id_maquina === Number(idMaquina) && 
            os.data_termino < inicioFiltro 
          ).sort((a: any, b: any) => b.data_termino.getTime() - a.data_termino.getTime());
          
          terminoAnterior = osAnterioresConcluidas.length > 0
            ? osAnterioresConcluidas[0].data_termino
            : inicioFiltro;
          
          inicioProxima = osMaquina[0].data_inicio;
      
        } else if (i === osMaquina.length - 1) {
          // Último TBF do mês: até fim do filtro
          terminoAnterior = osMaquina[i].data_termino;
          inicioProxima = fimFiltro;
          
        } else {
          // TBF intermediário
          terminoAnterior = osMaquina[i - 1].data_termino;
          inicioProxima = osMaquina[i].data_inicio;
        }
        
        // Recorte do período
        const tbfInicio = terminoAnterior > inicioFiltro ? terminoAnterior : inicioFiltro;
        const tbfFim = inicioProxima < fimFiltro ? inicioProxima : fimFiltro;

        if (tbfFim <= tbfInicio) continue;

        const diffHoras = (tbfFim.getTime() - tbfInicio.getTime()) / (1000 * 60 * 60);
        if (diffHoras > 0) totalHorasOperacionais += diffHoras;
      }
    }

    // Retorno final
    const countFalhas = falhasFinalizadasNoMes.size;

    if (countFalhas <= 1) {
      const aviso =
        countFalhas === 1
          ? "Houve apenas uma falha concluída no mês. MTBF não calculado."
          : "Nenhuma falha registrada. Retornando Uptime total.";

      return res.status(200).json({
        mtbf: 0,
        totalHorasOperacionais: Number(totalHorasOperacionais.toFixed(2)),
        countFalhas,
        aviso,
      });
    }

    const mtbf = totalHorasOperacionais / countFalhas;

    res.json({
      mtbf: Number(mtbf.toFixed(2)),
      totalHorasOperacionais: Number(totalHorasOperacionais.toFixed(2)),
      countFalhas,
    });

  } catch (err) {
    console.error("Erro ao calcular MTBF Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTBF Geral" });
  }
}


// ... [Outras funções como getOsConcluidasGeral, getCustoTotalGeral, etc.] ...


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



// Assumindo que 'db' é a conexão do MySQL já importada



export async function getMTTRAnual(req: Request, res: Response) {
  try {
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

    // 3. Query: traz todas as OS do ano
    const query = `
      SELECT o.data_inicio, o.data_termino
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
    `;

    const [rows]: any = await db.query(query, params);

    // 4. Estrutura anual: 12 meses
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      mttr: 0,
      countOS: 0
    }));

    // 5. Itera cada OS e distribui horas por mês
    for (const os of rows) {
      const dataInicioOS = new Date(os.data_inicio);
      const dataTerminoOS = new Date(os.data_termino);

      for (let mesIndex = 0; mesIndex < 12; mesIndex++) {
        const inicioMes = new Date(targetYear, mesIndex, 1, 0, 0, 0);
        const fimMes = new Date(targetYear, mesIndex + 1, 0, 23, 59, 59);

        // Interseção OS x mês
        const inicioConsiderado = dataInicioOS > inicioMes ? dataInicioOS : inicioMes;
        const terminoConsiderado = dataTerminoOS < fimMes ? dataTerminoOS : fimMes;

        const diffMs = terminoConsiderado.getTime() - inicioConsiderado.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60); // horas decimais

        if (diffHoras > 0) {
  // fullYearData[mesIndex] sempre existe, então usamos !
  fullYearData[mesIndex]!.mttr += diffHoras;
  fullYearData[mesIndex]!.countOS += 1;
}

      }
    }

    // 6. Calcula MTTR médio por mês
    const finalData = fullYearData.map(month => ({
      mes_num: month.mes_num,
      periodo: month.periodo,
      mttr: month.countOS > 0 ? Number((month.mttr / month.countOS).toFixed(2)) : 0
    }));

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
