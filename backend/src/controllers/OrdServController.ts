import { Request, Response } from "express";
import { OrdServRepository } from "../repositories/OrdServRepository";

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
      const idOrdServ = req.params.id;
      const descricao = req.body.descricao;
      const solucao = req.body.solucao;
      const custo = req.body.custo;
      const idUsuario = req.body.idUsuario;

      if (!descricao) {
        return res
          .status(400)
          .json({ error: "Campo obrigatório não preenchido!" });
      }

      const updated = await this.ordServRepo.updateOrdemServico(
        Number(idOrdServ),
        descricao,
        solucao || null,
        custo || null,
        idUsuario || null
      );
      if (!updated) {
        return res
          .status(404)
          .json({ error: "Ordem de serviço não encontrada" });
      }
      return res.json({ message: "Ordem de serviço atualizada com sucesso" });
    } catch (error) {
      console.error(
        "Erro ao atualizar informações da ordem de serviço:",
        error
      );
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
}
