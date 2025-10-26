import express, { Request, Response, Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { UserRepository } from "../repositories/userRepository";

const userRepository = new UserRepository();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(password, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1min",
      }
    );

    res.json({
      token,
      user: { id: user.id_usuario, nome: user.nome, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

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

  // 🔒 Garante que o segredo exista e é uma string
  const secret = process.env.JWT_SECRET!;
  // O "!" diz ao TypeScript que temos certeza de que não é undefined.

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return res.json({ message: "✅ Token válido", decoded });
  } catch (error) {
    return res.status(401).json({ message: "❌ Token inválido ou expirado" });
  }
};
