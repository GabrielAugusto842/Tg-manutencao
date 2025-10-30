import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../config/db"; // ✅ import necessário
import { UserRepository } from "../repositories/userRepository";

const userRepository = new UserRepository();

/**
 * Faz login e retorna token JWT + dados do usuário
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "E-mail ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(password, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id_usuario,
        nome: user.nome,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

/**
 * Troca a senha do usuário autenticado
 */
export const trocarSenha = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const email = req.email; // vem do authMiddleware

    if (!email) {
      res.status(403).json({ message: "Usuário não autenticado" });
      return;
    }

    // Busca usuário atual
    const [rows]: any = await db.execute("SELECT * FROM usuario WHERE email = ?", [email]);

    if (rows.length === 0) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    const usuario = rows[0];

    // Verifica senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      res.status(400).json({ message: "Senha atual incorreta" });
      return;
    }

    // Criptografa nova senha
    const hash = await bcrypt.hash(novaSenha, 10);

    // Atualiza no banco
    await db.execute("UPDATE usuario SET senha = ? WHERE email = ?", [hash, email]);

    res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    res.status(500).json({ message: "Erro interno ao trocar senha" });
  }
};

/**
 * Verifica se o token JWT é válido
 */
export const checkToken = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  if (!token) {
    return res.status(401).json({ message: "Token malformado" });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return res.json({ message: "✅ Token válido", decoded });
  } catch (error) {
    return res.status(401).json({ message: "❌ Token inválido ou expirado" });
  }
};
