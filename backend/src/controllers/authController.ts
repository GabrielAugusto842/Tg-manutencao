import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../config/db";
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
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};
