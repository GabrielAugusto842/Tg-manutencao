import { Request, Response } from "express";
import { UserRepository } from "../repositories/userRepository";
import { Usuario } from "../models/Usuario";
import { db } from "../config/db";
import bcrypt from 'bcryptjs';

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
      const [rows] = await db.execute(
        "SELECT u.id_usuario, u.nome, u.email, c.cargo AS cargo, s.setor FROM usuario u INNER JOIN cargo c ON u.id_cargo = c.id_cargo INNER JOIN setor s ON u.id_setor = s.id_setor"
      );

      const usuarios: Usuario[] = rows as Usuario[];

      res.status(200).json(usuarios);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);

      res
        .status(500)
        .json({ message: "Erro interno do servidor ao listar usuários." });
    }
  }

  public async trocarSenha(req: Request, res: Response): Promise<void> {
    const userEmail = req.email;
    const { senhaAtual, novaSenha } = req.body;

    if (!userEmail) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }
    if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
      res.status(400).json({ message: "Dados inválidos: A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (senhaAtual === novaSenha) {
        res.status(400).json({ message: "A nova senha deve ser diferente da senha atual." });
        return;
    }

    try {
      // 2. Encontrar o usuário e verificar a senha atual
      const user = await this.repository.findByEmail(userEmail);

      if (!user) {
        // Isso indica um token válido, mas o usuário não está no DB (muito raro)
        res.status(404).json({ message: "Usuário não encontrado." });
        return;
      }
      
      // 'user.senha' é o hash armazenado no DB
      const isSenhaCorreta = await bcrypt.compare(senhaAtual, user.senha);
      
      if (!isSenhaCorreta) {
        res.status(401).json({ message: "Senha atual incorreta." });
        return;
      }

      // 3. Gerar hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const novaSenhaHashed = await bcrypt.hash(novaSenha, salt);

      // 4. Atualizar a senha no banco de dados
      // OBSERVAÇÃO: Este método (updatePassword) DEVE ser implementado no seu UserRepository
      const success = await this.repository.updatePassword(user.id_usuario, novaSenhaHashed);

      if (!success) {
        throw new Error("Falha ao atualizar a senha no banco de dados.");
      }

      // 5. Sucesso
      // Retorna uma instrução para deslogar o usuário por segurança
      res.json({ 
        message: "Senha alterada com sucesso! Você será desconectado por segurança.",
        forceLogout: true 
      });

    } catch (error) {
      console.error("Erro ao trocar a senha:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}
