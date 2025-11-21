import { Request, Response } from "express";
import { UserRepository } from "../repositories/userRepository";
import { Usuario } from "../models/Usuario";
import { db } from "../config/db";
import bcrypt from "bcryptjs";

interface UsuarioParams {
  id: string;
}

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

  getById = async (
    req: Request<UsuarioParams>,
    res: Response
  ): Promise<Response> => {
    try {
      const id_usuario = parseInt(req.params.id, 10);

      if (isNaN(id_usuario)) {
        return res.status(400).json({
          error: "ID de usuário inválido. Deve ser um número inteiro.",
        });
      }

      const usuario = await this.repository.findById(id_usuario);

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.json(usuario);
    } catch (error) {
      console.error("Erro ao buscar Usuário:", error);
      return res.status(500).json({ error: "Erro interno ao buscar usuário" });
    }
  };

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

  public async cadastroUsuario(req: Request, res: Response): Promise<void> {
    const { nome, email, password, id_cargo, id_setor } = req.body;

    const saltRounds = 10;

    if (!id_cargo || !id_setor) {
      res.status(400).json({ message: "ID de Cargo ou Setor ausente." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const novoUsuario: Partial<Usuario> = {
      nome,
      email,
      senha: hashedPassword,
      id_cargo,
      id_setor,
    };

    await this.repository.createUsuario(novoUsuario);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario: { nome, email, id_cargo, id_setor },
    });
  }

  public async getManutentores(req: Request, res: Response): Promise<void> {
    try {
      const manutentores = await this.repository.buscarManutentores();

      // Retorna a lista de manutentores com status 200 OK
      res.status(200).json(manutentores);
    } catch (error) {
      console.error("Erro ao buscar manutentores:", error);

      res.status(500).json({
        message: "Erro interno do servidor ao listar manutentores.",
      });
    }
  }

  public updateUsuario = async (
    req: Request<UsuarioParams>,
    res: Response
  ): Promise<Response> => {
    try {
      const id_usuario = parseInt(req.params.id, 10);
      if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID de usuário inválido" });
      }

      // 1. Captura todos os campos, incluindo o opcional 'senha'
      const { nome, email, id_cargo, id_setor, senha } = req.body;

      // Verifica se o usuário existe (boa prática)
      const usuarioExistente = await this.repository.findById(id_usuario);
      if (!usuarioExistente) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // 2. Monta o objeto de dados a serem atualizados
      const dadosParaAtualizar: Partial<Usuario> = {
        nome,
        email,
        id_cargo,
        id_setor,
      };

      // 3. 🔑 Lógica para Atualização de Senha
      // Se a senha foi fornecida, hasheia antes de incluir no objeto de atualização
      if (senha && typeof senha === "string" && senha.trim() !== "") {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);
        dadosParaAtualizar.senha = hashedPassword; // Campo 'senha' hasheado
      }

      // 4. Executa a atualização
      // O seu updateUsuario no Repository deve ser capaz de receber Partial<Usuario>
      this.repository.updateUsuario(id_usuario, dadosParaAtualizar);

      return res.json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar usuário" });
    }
  };
}
