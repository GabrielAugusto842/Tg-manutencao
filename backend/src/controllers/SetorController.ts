import { Request, Response } from "express";
import { SetorRepository } from "../repositories/SetorRepository";

export class SetorController {
    private setorRepo = new SetorRepository();
    getAllSetores = async (req: Request, res: Response): Promise<Response> => {
        try {
            const setores = await this.setorRepo.getAllSetores();
            return res.json(setores);
        } catch(error) {
            console.error('Erro ao buscar os setores: ', error)
            return res.status(500).json({error: 'Erro interno ao buscar setores!'})
        }
    }

    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idSetor = req.params.id;
            const setor = await this.setorRepo.findById(Number(idSetor));
            if (!setor) {
                return res.status(404).json({ error: 'Setor não encontrado' });
            }
            return res.json(setor);
        } catch (error) {
            console.error('Erro ao buscar setor:', error);
            return res.status(500).json({ error: 'Erro ao buscar setor' });
        }
    };

    createSetor = async (req: Request, res: Response): Promise<Response> => {
        try {
            const nomeSetor = req.body.setor;
            const descricao = req.body.descricao;

            if (!nomeSetor) {
                return res.status(400).json({ error: 'Campo nome do setor é obrigatório' });
            }

            const novoSetor = await this.setorRepo.createSetor(nomeSetor, descricao || null);
            return res.status(201).json(novoSetor);
        } catch (error) {
            console.error('Erro ao criar setor:', error);
            return res.status(500).json({ error: 'Erro ao criar setor' });
        }
    };

    updateSetor = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idSetor = req.params.id;
            const nomeSetor = req.body.setor;
            const descricao = req.body.descricao;

            if (!nomeSetor) {
                return res.status(400).json({ error: 'Campo nome do setor é obrigatório' });
            }

            const updated = await this.setorRepo.updateSetor(Number(idSetor), nomeSetor, descricao || null);
            if (!updated) {
                return res.status(404).json({ error: 'Setor não encontrado' });
            }
            return res.json({ message: 'Setor atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar setor:', error);
            return res.status(500).json({ error: 'Erro ao atualizar setor' });
        }
    };

    deleteSetor = async (req: Request, res: Response): Promise<Response> => {
        try {
            const idSetor = req.params.id;
            const deleted = await this.setorRepo.deleteSetor(Number(idSetor));
            if (!deleted) {
                return res.status(404).json({ error: 'Setor não encontrado ou já excluído' });
            }
            return res.json({ message: 'Setor excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir setor:', error);
            return res.status(500).json({ error: 'Erro ao excluir setor' });
        }
    };
}