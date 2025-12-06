import { Request, Response } from "express";
import { db } from "../config/db";
import { RowDataPacket } from "mysql2";

// -------------------------------
// MTTR GERAL
// -------------------------------
export async function getMTTRGeral(req: Request, res: Response) {
  try {
    let { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const agora = new Date();

    const m = mes && !isNaN(Number(mes)) ? Number(mes) : agora.getMonth() + 1;
    const y = ano && !isNaN(Number(ano)) ? Number(ano) : agora.getFullYear();

    const mesValido = Math.min(Math.max(m, 1), 12);

    const dataInicial = new Date(y, mesValido - 1, 1, 0, 0, 0);
    const dataFinal = new Date(y, mesValido, 0, 23, 59, 59, 999);

    const params: any[] = [dataInicial, dataFinal];

    let where = `
      WHERE o.data_inicio IS NOT NULL
        AND o.data_termino IS NOT NULL
        AND o.data_termino BETWEEN ? AND ?
    `;

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

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
      return res.json({
        mttr: 0,
        mensagem: "Não há ordens de serviço no período.",
      });
    }

    const mttrHoras = mediaMinutos / 60;

    res.json({ mttr: Number(mttrHoras.toFixed(2)), mensagem: null });
  } catch (err) {
    console.error("Erro ao calcular MTTR Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTR Geral" });
  }
}

// -------------------------------
// MTTR ANUAL / MENSAL
// -------------------------------
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
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const monthData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      somaDuracaoMinutos: 0,
      countOS: 0,
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
    const finalData = monthData.map((month) => {
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

// -------------------------------
// MTTR POR MÁQUINA
// -------------------------------
export async function getMTTRMaquina(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor, idMaquina } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
      idMaquina?: string;
    };

    let query = `
  SELECT 
    AVG(TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_termino)) AS mttr
  FROM ordem_servico o
  JOIN maquina m ON m.id_maquina = o.id_maquina
  WHERE o.data_inicio IS NOT NULL 
    AND o.data_termino IS NOT NULL
`;

    const params: any[] = [];

    if (mes) {
      query += " AND MONTH(o.data_abertura) = ? ";
      params.push(mes);
    }

    if (ano) {
      query += " AND YEAR(o.data_abertura) = ? ";
      params.push(ano);
    }

    if (idSetor) {
      query += " AND m.id_setor = ? "; // <-- CORRETO!
      params.push(idSetor);
    }

    if (idMaquina) {
      query += " AND o.id_maquina = ? ";
      params.push(idMaquina);
    }

    const [rows] = await db.query<RowDataPacket[]>(query, params);

    const mttr = rows[0]?.mttr ?? 0;

    res.json({ mttr });
  } catch (err) {
    console.error("Erro ao buscar MTTR da máquina:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

// -------------------------------
// MTBF GERAL
// -------------------------------
export async function getMTBFGeral(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ erro: "Mês inválido." });
    }

    const mesIndex = mesNum - 1;
    // O MTBF será calculado apenas para falhas dentro do mês
    const inicioFiltro = new Date(anoNum, mesIndex, 1, 0, 0, 0);
    const fimFiltro = new Date(anoNum, mesIndex + 1, 0, 23, 59, 59, 999);

    const params: any[] = [inicioFiltro, fimFiltro];

    let filtro = ` WHERE o.data_abertura BETWEEN ? AND ? `;
    if (idSetor) {
      filtro += " AND m.id_setor = ? ";
      params.push(idSetor);
    }

    // Query com PARTITION BY para calcular intervalo entre falhas por máquina
    const query = `
      WITH falhas AS (
        SELECT 
          o.id_maquina,
          o.data_abertura AS falha,
          LAG(o.data_abertura) OVER (PARTITION BY o.id_maquina ORDER BY o.data_abertura) AS falha_anterior
        FROM ordem_servico o
        JOIN maquina m ON m.id_maquina = o.id_maquina
        ${filtro}
      ),
      intervalos AS (
        SELECT TIMESTAMPDIFF(MINUTE, falha_anterior, falha)/60 AS horas_entre_falhas
        FROM falhas
        WHERE falha_anterior IS NOT NULL
      )
      SELECT AVG(horas_entre_falhas) AS mtbf, COUNT(*) AS total_intervalos
      FROM intervalos;
    `;

    const [rows]: any = await db.query(query, params);
    let mtbf = parseFloat(rows[0]?.mtbf);
    const total_intervalos = parseInt(rows[0]?.total_intervalos, 10) || 0;

    if (isNaN(mtbf)) mtbf = 0;

    if (total_intervalos === 0) {
      return res.status(200).json({
        mtbf: 0,
        aviso:
          "Não há falhas suficientes para calcular MTBF (precisa de 2 ou mais no período).",
      });
    }

    return res.status(200).json({
      mtbf: Number(mtbf.toFixed(2)),
      quantidade_intervalos: total_intervalos,
    });
  } catch (err) {
    console.error("Erro ao calcular MTBF Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTBF Geral" });
  }
}

// -------------------------------
// MTBF ANUAL/MENSAL
// -------------------------------
export async function getMTBFAnual(req: Request, res: Response) {
  try {
    const { ano, idSetor } = req.query as {
      ano?: string;
      idSetor?: string;
    };
    const params: any[] = [];

    const targetYear = Number(ano) || new Date().getFullYear();

    // Filtro baseado no ano de abertura para considerar todas as falhas no ano
    let where =
      "WHERE o.data_abertura IS NOT NULL AND YEAR(o.data_abertura) = ?";
    params.push(targetYear);

    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    // Query com LAG() para calcular MTBF real, filtrando intervalos internos ao mesmo mês
    const query = `
      WITH falhas_do_ano AS (
        SELECT 
          o.id_maquina,
          o.data_abertura AS falha_atual,
          LAG(o.data_abertura) OVER (PARTITION BY o.id_maquina ORDER BY o.data_abertura) AS falha_anterior
        FROM ordem_servico o
        JOIN maquina m ON m.id_maquina = o.id_maquina
        ${where}
      ),
      intervalos AS (
        SELECT 
          MONTH(falha_atual) AS mes_num,
          TIMESTAMPDIFF(MINUTE, falha_anterior, falha_atual) / 60.0 AS horas_entre_falhas
        FROM falhas_do_ano
        WHERE falha_anterior IS NOT NULL
          AND MONTH(falha_anterior) = MONTH(falha_atual)  -- Intervalos internos ao mesmo mês
      )
      SELECT 
        mes_num,
        AVG(horas_entre_falhas) AS mtbf_real,
        COUNT(*) AS total_intervalos
      FROM intervalos
      GROUP BY mes_num
      ORDER BY mes_num ASC
    `;

    const [rows]: any = await db.query(query, params);

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => {
      return {
        mes_num: i + 1,
        periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
        mtbf: 0.0,
      };
    });

    const finalData = fullYearData.map((monthData) => {
      const dbRow = rows.find((row: any) => row.mes_num === monthData.mes_num);

      if (dbRow) {
        const mtbfReal = parseFloat(dbRow.mtbf_real);

        return {
          ...monthData,
          mtbf: Number(mtbfReal.toFixed(2)),
        };
      }

      return monthData;
    });

    res.json(finalData);
  } catch (err) {
    console.error("Erro ao buscar MTBF Anual (Intervalos Internos):", err);
    res
      .status(500)
      .json({ erro: "Erro ao calcular MTBF Anual (Intervalos Internos)" });
  }
}

// -------------------------------
// MTBF POR MAQUINA
// -------------------------------
export async function getMTBFMaquina(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor, idMaquina } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
      idMaquina?: string;
    };

    if (!idMaquina) {
      return res.status(400).json({ erro: "idMaquina é obrigatório" });
    }

    // WHERE DINÂMICO
    let where = "WHERE o.id_maquina = ?";
    const params: any[] = [idMaquina];

    if (mes) {
      where += " AND MONTH(o.data_abertura) = ?";
      params.push(mes);
    }
    if (ano) {
      where += " AND YEAR(o.data_abertura) = ?";
      params.push(ano);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      WITH falhas AS (
        SELECT
          o.id_maquina,
          o.data_abertura AS falha,
          LAG(o.data_abertura) OVER (
            PARTITION BY o.id_maquina
            ORDER BY o.data_abertura
          ) AS falha_anterior
        FROM ordem_servico o
        JOIN maquina m ON m.id_maquina = o.id_maquina
        ${where}
      ),
      intervalos AS (
        SELECT 
          TIMESTAMPDIFF(HOUR, falha_anterior, falha) AS horas_entre_falhas
        FROM falhas
        WHERE falha_anterior IS NOT NULL
      )
      SELECT 
        m.id_maquina,
        m.nome AS maquina,
        IFNULL(AVG(i.horas_entre_falhas), 0) AS mtbf_horas
      FROM maquina m
      LEFT JOIN intervalos i ON i.horas_entre_falhas IS NOT NULL
      WHERE m.id_maquina = ?
      GROUP BY m.id_maquina, m.nome;
    `;

    params.push(idMaquina);

    const [rows]: any = await db.query(query, params);

    res.json({
      id_maquina: rows[0]?.id_maquina,
      maquina: rows[0]?.maquina,
      mtbf_horas: rows[0]?.mtbf_horas ?? 0,
    });
  } catch (err) {
    console.error("Erro ao buscar MTBF da máquina:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

// -------------------------------------------
// CUSTO TOTAL DE MANUTENÇÃO
// -------------------------------------------
export async function getCustoTotalGeral(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

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
// MTTA GERAL
// -------------------------------
export async function getMTTAGeral(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
    };

    const hoje = new Date();
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

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
      mensagem:
        totalOs === 0
          ? "Nenhuma ordem de serviço encontrada no período"
          : undefined,
    });
  } catch (err) {
    console.error("Erro ao calcular MTTA Geral:", err);
    res.status(500).json({ erro: "Erro ao calcular MTTA Geral" });
  }
}

// -------------------------------
// MTTA POR MÁQUINA
// -------------------------------
export async function getMTTAMaquina(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor, idMaquina } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
      idMaquina?: string;
    };

    let query = `
  SELECT 
    AVG(TIMESTAMPDIFF(MINUTE, o.data_abertura, o.data_inicio)) AS mtta
  FROM ordem_servico o
  JOIN maquina m ON m.id_maquina = o.id_maquina
  WHERE o.data_inicio IS NOT NULL
`;

    const params: any[] = [];

    if (mes) {
      query += " AND MONTH(o.data_abertura) = ?";
      params.push(mes);
    }

    if (ano) {
      query += " AND YEAR(o.data_abertura) = ?";
      params.push(ano);
    }

    if (idSetor) {
      query += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    if (idMaquina) {
      query += " AND o.id_maquina = ?";
      params.push(idMaquina);
    }

    const [rows] = await db.query<RowDataPacket[]>(query, params);

    const mtta = rows[0]?.mtta ?? 0; // valor em minutos

    res.json({ mtta });
  } catch (err) {
    console.error("Erro ao buscar MTTA da máquina:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
}

// -------------------------------------------
// BACKLOG GERAL (Contagem total de OS pendentes)
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
// BACKLOG DETALHADO (Lista de OS pendentes)
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

// -------------------------------------------
// MTTA Anual (Mean Time To Acknowledge) por mês
export async function getMTTAAnual(req: Request, res: Response) {
  try {
    const { ano, idSetor } = req.query;
    const params: any[] = [];

    // Garante que as datas de cálculo existam
    let where =
      "WHERE o.data_inicio IS NOT NULL AND o.data_abertura IS NOT NULL";

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
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const fullYearData = Array.from({ length: 12 }, (_, i) => ({
      mes_num: i + 1,
      periodo: `${monthNames[i]}/${String(targetYear).slice(2)}`,
      mttaHoras: 0, // inicializa em 0 horas
    }));

    const finalData = fullYearData.map((monthData) => {
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
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

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
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

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
      totalCusto: parseFloat(row.total_custo) || 0,
    }));

    res.json(ranking);
  } catch (err) {
    console.error("Erro ao calcular ranking de máquinas por custo:", err);
    res
      .status(500)
      .json({ erro: "Erro ao buscar ranking de máquinas por custo" });
  }
}

export async function getRankingSetoresOrdens(req: Request, res: Response) {
  try {
    let { mes, ano } = req.query as { mes?: string; ano?: string };

    const hoje = new Date();
    const mesNum =
      mes && !isNaN(Number(mes)) ? Number(mes) : hoje.getMonth() + 1;
    const anoNum =
      ano && !isNaN(Number(ano)) ? Number(ano) : hoje.getFullYear();

    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const query = `
      SELECT 
        s.id_setor,
        s.setor AS nome_setor,
        COUNT(o.id_ord_serv) AS total_ordens
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      JOIN setor s ON s.id_setor = m.id_setor
      WHERE o.data_abertura BETWEEN ? AND ?
      GROUP BY s.id_setor, s.setor
      ORDER BY total_ordens DESC
      LIMIT 5
    `;

    const [rows]: any = await db.query(query, [dataInicial, dataFinal]);

    const ranking = rows.map((row: any) => ({
      idSetor: row.id_setor,
      nomeSetor: row.nome_setor,
      totalOrdens: Number(row.total_ordens),
    }));

    res.json(ranking);
  } catch (err) {
    console.error("Erro ao gerar ranking de setores:", err);
    res.status(500).json({ erro: "Falha ao gerar ranking de setores" });
  }
}

export async function getRankingSetoresCusto(req: Request, res: Response) {
  try {
    const { mes, ano } = req.query as { mes?: string; ano?: string };
    const hoje = new Date();
    const mesNum = mes ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano ? Number(ano) : hoje.getFullYear();

    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const [rows]: any = await db.query(
      `SELECT s.setor AS nomeSetor, SUM(o.custo) AS totalCusto
       FROM ordem_servico o
       JOIN maquina m ON m.id_maquina = o.id_maquina
       JOIN setor s ON s.id_setor = m.id_setor
       WHERE o.data_termino IS NOT NULL
         AND o.custo IS NOT NULL
         AND o.data_termino BETWEEN ? AND ?
       GROUP BY s.id_setor, s.setor
       ORDER BY totalCusto DESC 
       LIMIT 5`,
      [dataInicial, dataFinal]
    );

    const ranking = rows.map((row: any) => ({
      nomeSetor: row.nomeSetor,
      totalCusto: parseFloat(row.totalCusto) || 0,
    }));

    res.json(ranking);
  } catch (e) {
    console.error("Erro no ranking de setores por custo:", e);
    res
      .status(500)
      .json({ erro: "Falha ao buscar ranking de setores por custo" });
  }
}

export async function getCustoMaquina(req: Request, res: Response) {
  try {
    const { mes, ano, idSetor, idMaquina } = req.query as {
      mes?: string;
      ano?: string;
      idSetor?: string;
      idMaquina?: string;
    };

    if (!idMaquina) {
      return res.status(400).json({ erro: "idMaquina é obrigatório" });
    }

    let where = "WHERE o.id_maquina = ?";
    const params: any[] = [idMaquina];

    if (mes) {
      where += " AND MONTH(o.data_termino) = ?";
      params.push(mes);
    }
    if (ano) {
      where += " AND YEAR(o.data_termino) = ?";
      params.push(ano);
    }
    if (idSetor) {
      where += " AND m.id_setor = ?";
      params.push(idSetor);
    }

    const query = `
      SELECT 
        m.nome AS maquina,
        IFNULL(SUM(o.custo), 0) AS custoTotal
      FROM ordem_servico o
      JOIN maquina m ON m.id_maquina = o.id_maquina
      ${where}
      GROUP BY m.id_maquina, m.nome
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, params);

    res.json({
      maquina: rows[0]?.maquina ?? "Não encontrada",
      custoTotal: rows[0]?.custoTotal ?? 0,
    });
  } catch (err) {
    console.error("Erro ao buscar custo da máquina:", err);
    res.status(500).json({ erro: "Erro ao buscar custo" });
  }
}

export async function getRankingUsuariosOrdens(req: Request, res: Response) {
  try {
    const { mes, ano } = req.query as { mes?: string; ano?: string };
    const hoje = new Date();
    const mesNum = mes ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano ? Number(ano) : hoje.getFullYear();

    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const [rows]: any = await db.query(
      `
      SELECT u.nome AS nomeUsuario, COUNT(o.id_ord_serv) AS totalOrdens
      FROM ordem_servico o
      JOIN usuario u ON u.id_usuario = o.id_usuario
      WHERE o.data_termino IS NOT NULL
        AND o.data_termino BETWEEN ? AND ?
      GROUP BY u.id_usuario, u.nome
      ORDER BY totalOrdens DESC
      LIMIT 5
      `,
      [dataInicial, dataFinal]
    );

    const ranking = rows.map((row: any) => ({
      nomeUsuario: row.nomeUsuario,
      totalOrdens: Number(row.totalOrdens) || 0,
    }));

    res.json(ranking);
  } catch (e) {
    console.error("Erro no ranking de usuários por ordens:", e);
    res
      .status(500)
      .json({ erro: "Falha ao buscar ranking de usuários por ordens" });
  }
}

export async function getRankingUsuariosCusto(req: Request, res: Response) {
  try {
    const { mes, ano } = req.query as { mes?: string; ano?: string };
    const hoje = new Date();
    const mesNum = mes ? Number(mes) : hoje.getMonth() + 1;
    const anoNum = ano ? Number(ano) : hoje.getFullYear();

    const dataInicial = new Date(anoNum, mesNum - 1, 1, 0, 0, 0);
    const dataFinal = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

    const [rows]: any = await db.query(
      `
      SELECT u.nome AS nomeUsuario, SUM(o.custo) AS totalCusto
      FROM ordem_servico o
      JOIN usuario u ON u.id_usuario = o.id_usuario
      WHERE o.data_termino BETWEEN ? AND ?
      GROUP BY u.id_usuario, u.nome
      ORDER BY totalCusto DESC
      LIMIT 5
      `,
      [dataInicial, dataFinal]
    );

    const ranking = rows.map((row: any) => ({
      nomeUsuario: row.nomeUsuario,
      totalCusto: Number(row.totalCusto) || 0,
    }));

    res.json(ranking);
  } catch (e) {
    console.error("Erro no ranking de usuários por custo:", e);
    res
      .status(500)
      .json({ erro: "Falha ao buscar ranking de usuários por custo" });
  }
}
