import { Request, Response } from "express";
import { OrdServRepository } from "../repositories/OrdServRepository";
import { db } from "../config/db";

export class OrdServController {
  constructor(private ordServRepo: OrdServRepository) {}
  getAllOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const os = await this.ordServRepo.getAllOrdServ();
      return res.json(os);
    } catch (error) {
      console.error("Erro ao buscar as ordens de serviço: ", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar ordens de serviço!" });
    }
  };

  getOSAbertas = async (req: Request, res: Response): Promise<Response> => {
    try {
      const os = await this.ordServRepo.getOSAbertas();
      return res.json(os);
    } catch (error) {
      console.error("Erro ao buscar as ordens de serviço em aberto: ", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar ordens de serviço em aberto!" });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idOrdServ = req.params.id;
      const os = await this.ordServRepo.findById(Number(idOrdServ));
      if (!os) {
        return res
          .status(404)
          .json({ error: "Ordem de serviço não encontrada" });
      }
      return res.json(os);
    } catch (error) {
      console.error("Erro ao buscar a ordem de serviço:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar a ordem de serviço" });
    }
  };

  createOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const descricao = req.body.descricao;
      const operacao = req.body.operacao;
      const idMaquina = req.body.idMaquina;

      if (!descricao || idMaquina == null || operacao == null) {
        return res
          .status(400)
          .json({ error: "Campo obrigatório não preenchido!" });
      }

      const novaOS = await this.ordServRepo.createOrdServ(
        descricao,
        operacao,
        idMaquina
      );
      return res.status(201).json(novaOS);
    } catch (error) {
      console.error("Erro ao criar a Ordem de serviço:", error);
      return res
        .status(500)
        .json({ error: "Erro ao criar a Ordem de serviço" });
    }
  };

  updateOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idOrdServ = Number(req.params.id);

      const osAtual: any = await this.ordServRepo.findById(idOrdServ);
      if (!osAtual)
        return res
          .status(404)
          .json({ error: "Ordem de serviço não encontrada" });

      const { descricao, solucao, custo, idUsuario } = req.body;

      // Monta o objeto de campos para atualização
      const camposAtualizados: any = {};
      if (osAtual.status === "Aberta") {
        if (descricao !== undefined) camposAtualizados.descricao = descricao;
        if (idUsuario !== undefined) camposAtualizados.manutentor = idUsuario;
      } else if (osAtual.status === "Em andamento") {
        if (descricao !== undefined) camposAtualizados.descricao = descricao;
        if (idUsuario !== undefined) camposAtualizados.manutentor = idUsuario;
      } else if (osAtual.status === "Finalizado") {
        if (descricao !== undefined) camposAtualizados.descricao = descricao;
        if (solucao !== undefined) camposAtualizados.solucao = solucao;
        if (custo !== undefined) camposAtualizados.custo = custo;
      }

      const updated = await this.ordServRepo.updateOrdemServico(
        idOrdServ,
        camposAtualizados
      );

      if (!updated)
        return res.status(400).json({ error: "Nenhum campo atualizado." });

      return res.json({ message: "Ordem de serviço atualizada com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar informações da ordem de serviço" });
    }
  };

  finalizarOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idOrdServ = req.params.id;
      const solucao = req.body.solucao;
      const custo = req.body.custo;

      if (!solucao) {
        return res
          .status(400)
          .json({ error: "Campo obrigatório não preenchido!" });
      }

      const updated = await this.ordServRepo.finalizarOrdemServico(
        Number(idOrdServ),
        solucao,
        custo || null
      );
      if (!updated) {
        return res
          .status(404)
          .json({ error: "Ordem de serviço não encontrada" });
      }
      return res.json({ message: "Ordem de serviço finalizada com sucesso" });
    } catch (error) {
      console.error("Erro ao finalizar ordem de serviço:", error);
      return res
        .status(500)
        .json({ error: "Erro ao finalizar ordem de serviço" });
    }
  };

  aceitarOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idOrdServ = Number(req.params.id);
      const { idUsuario } = req.body;

      if (!idUsuario) {
        return res.status(400).json({ error: "idUsuario é obrigatório!" });
      }

      const aceito = await this.ordServRepo.aceitarOrdemServico(
        idOrdServ,
        idUsuario
      );

      if (!aceito) {
        return res.status(400).json({ error: "Não foi possível aceitar a OS" });
      }

      return res.json({ message: "Ordem de serviço aceita com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao aceitar OS:", error);
      return res
        .status(500)
        .json({ error: error.message || "Erro ao aceitar OS" });
    }
  };

  deleteOrdServ = async (req: Request, res: Response): Promise<Response> => {
    try {
      const idOrdServ = req.params.id;
      const deleted = await this.ordServRepo.deleteOrdServ(Number(idOrdServ));
      if (!deleted) {
        return res
          .status(404)
          .json({ error: "Ordem de serviço não encontrada ou já excluída" });
      }
      return res.json({ message: "Ordem de serviço excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);
      return res
        .status(500)
        .json({ error: "Erro ao excluir ordem de serviço" });
    }
  };

  getByManutentor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const ordens = await this.ordServRepo.getByManutentor(Number(id));

      return res.json(ordens);
    } catch (error) {
      console.error("Erro ao buscar O.S do manutentor:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar as ordens do manutentor" });
    }
  };
  getDashboardData = async (req: Request, res: Response) => {
    try {
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();

      // Pega o id do manutentor da query de forma segura
      const idUsuario =
        req.query.id_usuario !== undefined
          ? Number(req.query.id_usuario)
          : null;

      // Monta query base
      let sql = `
      SELECT 
        SUM(CASE WHEN e.status = 'Aberto' THEN 1 ELSE 0 END) AS abertas,
        SUM(CASE WHEN e.status = 'Em andamento' THEN 1 ELSE 0 END) AS andamento,
        SUM(CASE WHEN e.status = 'Finalizado' THEN 1 ELSE 0 END) AS finalizadas
      FROM ordem_servico os
      JOIN estado e ON os.id_estado = e.id_estado
      WHERE MONTH(os.data_abertura) = ? AND YEAR(os.data_abertura) = ?
    `;

      const params: any[] = [mesAtual, anoAtual];

      // Se for Manutentor, adiciona o filtro de usuário, aplicando-o a todos os status
      // Se for outro cargo (idUsuario é null), a query retorna todos os resultados do mês.
      if (idUsuario) {
        // O filtro id_usuario será aplicado a todas as OS contadas (Abertas, Em Andamento, Finalizadas)
        sql += " AND os.id_usuario = ?";
        params.push(idUsuario);
      }

      console.log("SQL do dashboard: ", sql);
      console.log("Parâmetros da query: ", params);

      const [rows] = await db.query(sql, params);

      const totais =
        Array.isArray(rows) && rows.length > 0
          ? rows[0]
          : { abertas: 0, andamento: 0, finalizadas: 0 };

      res.json(totais);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      res.status(500).json({ error: "Erro ao carregar dados do dashboard" });
    }
  };
}
