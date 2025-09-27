import { Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';

export const cadastrarUsuario = async (req: Request, res: Response) => {
  const { nome, email, password } = req.body;

const [existeUsuario] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email])

if ((existeUsuario as any[]).length > 0) {
    return res.status(409).json({message: 'Email já cadastrado no sistema'});
}

const hashSenha = await bcrypt.hash(password, 10);

await db.execute('INSERT INTO usuario (nome, email, senha) VALUES (?, ?)', [
    nome,
    email,
    hashSenha,
  ]);

  res.status(200).json({message: 'Usuário cadastrado com sucesso'});

};
