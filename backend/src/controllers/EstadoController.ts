import { Request, Response } from "express";
import { EstadoRepository } from "../repositories/EstadoRepository";

export class EstadoController {
    static getAllEstados(arg0: string, getAllEstados: any) {
      throw new Error("Method not implemented.");
    }
    private estadoRepo = new EstadoRepository();
    getAllEstados = async (req: Request, res: Response): Promise<Response> => {
        try {
            const estados = await this.estadoRepo.getAllEstados();
            return res.json(estados);
        } catch(error) {
            console.error('Erro ao buscar Estados de OS: ', error)
            return res.status(500).json({error: 'Erro interno ao buscar estados!'})
        }
    }
}