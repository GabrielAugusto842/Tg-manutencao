import { Request, Response } from "express";
import { MaquinaRepository } from "../repositories/MaquinaRepository";

export class MaquinaController {
    private maquinaRepo = new MaquinaRepository();
    getAllMaquinas = async (req: Request, res: Response): Promise<Response> => {
        try {
            const maquinas = await this.maquinaRepo.getAllMaquinas();
            return res.json(maquinas);
        } catch(error) {
            console.error('Erro ao buscar as máquinas: ', error)
            return res.status(500).json({error: 'Erro interno ao buscar máquinas!'})
        }
    }

    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idMaquina = req.params.id;
            const maquina = await this.maquinaRepo.findById(Number(idMaquina));
            if (!maquina) {
                return res.status(404).json({ error: 'Máquina não encontrada' });
            }
            return res.json(maquina);
        } catch (error) {
            console.error('Erro ao buscar máquina:', error);
            return res.status(500).json({ error: 'Erro ao buscar máquina' });
        }
    };

    createMaquina = async (req: Request, res: Response): Promise<Response> => {
        try {
            const nome = req.body.nome;
            const marca = req.body.marca;
            const modelo = req.body.modelo;
            const numeroSerie = req.body.numeroSerie;
            const tag = req.body.tag;
            const producaoHora = req.body.producaoHora;
            const disponibilidadeMes = req.body.disponibilidadeMes;
            const idSetor = req.body.idSetor;

            if (!nome || !marca || !numeroSerie || !disponibilidadeMes || !idSetor) {
                return res.status(400).json({ error: 'Campo obrigatório não preenchido!' });
            }

            const novaMaquina = await this.maquinaRepo.createMaquina(nome, marca, numeroSerie, 
                modelo || null, tag || null, producaoHora || null, disponibilidadeMes, idSetor
            );
            return res.status(201).json(novaMaquina);
        } catch (error) {
            console.error('Erro ao criar a máquina:', error);
            return res.status(500).json({ error: 'Erro ao criar a máquina' });
        }
    };

    updateMaquina = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idMaquina = req.params.id;
            const nome = req.body.nome;
            const marca = req.body.marca;
            const modelo = req.body.modelo;
            const numeroSerie = req.body.numeroSerie;
            const tag = req.body.tag;
            const producaoHora = req.body.producaoHora;
            const disponibilidadeMes = req.body.disponibilidadeMes;
            const idSetor = req.body.idSetor;
            console.log(req.body)

            if (!nome || !marca || !numeroSerie || !disponibilidadeMes || !idSetor) {
                return res.status(400).json({ error: 'Campo obrigatório não preenchido!' });
            }

            const updated = await this.maquinaRepo.updateMaquina(
                Number(idMaquina), nome, marca, numeroSerie, modelo || null, tag || null,
                producaoHora || null, disponibilidadeMes, idSetor
            );
            if (!updated) {
                return res.status(404).json({ error: 'Máquina não encontrada' });
            }
            return res.json({ message: 'Máquina atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar informações da máquina:', error);
            return res.status(500).json({ error: 'Erro ao atualizar informações da máquina' });
        }
    };

    deleteMaquina = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idMaquina = req.params.id;
            const deleted = await this.maquinaRepo.deleteMaquina(Number(idMaquina));
            if (!deleted) {
                return res.status(404).json({ error: 'Máquina não encontrada ou já excluída' });
            }
            return res.json({ message: 'Máquina excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir máquina:', error);
            return res.status(500).json({ error: 'Erro ao excluir máquina' });
        }
    };
}