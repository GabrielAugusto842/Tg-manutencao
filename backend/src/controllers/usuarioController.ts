import { Request, Response } from "express";
import { UserRepository } from "../repositories/userRepository";
import {Usuario} from "../models/Usuario";
import { db } from "../config/db";

export class UsuarioController {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    async getUsuario(req: Request, res: Response) {
        try {
            const email = req.params.email as string;
            if (!email) {
                throw new Error("Variável não existente");
            }
            const usuario = await this.repository.findByEmail(email);
            res.json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: "Erro no banco de dados" });
        }
    }   

    public async getUsuarios(req: Request, res: Response): Promise<void> {
        try {
           
            const [rows] = await db.execute('SELECT idUsuario, nome, email FROM usuario');

            const usuarios: Usuario[] = rows as Usuario[];

            res.status(200).json(usuarios);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            
            res.status(500).json({ message: 'Erro interno do servidor ao listar usuários.' });
        }
    }
}