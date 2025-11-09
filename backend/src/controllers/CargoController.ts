import { Request, Response } from "express";
import { CargoRepository } from "../repositories/CargoRepository";

export class CargoController {
    private cargoRepo = new CargoRepository();
    getAllCargos = async (req: Request, res: Response): Promise<Response> => {
        try {
            const cargos = await this.cargoRepo.getAllCargos();
            return res.json(cargos);
        } catch(error) {
            console.error('Erro ao buscar cargos: ', error)
            return res.status(500).json({error: 'Erro interno ao buscar cargos'})
        }
    }
}