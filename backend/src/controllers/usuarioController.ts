import { Request, Response } from "express";
import { UserRepository } from "../repositories/userRepository";

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
}