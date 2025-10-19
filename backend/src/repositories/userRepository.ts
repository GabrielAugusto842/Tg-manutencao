import { db } from "../config/db";
import { Usuario } from "../models/Usuario";

export class UserRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [email]);
    const usuario = (rows as any)[0];
    return usuario ? new Usuario(usuario.id_usuario, usuario.nome, usuario.email, usuario.senha, usuario.id_cargo, usuario.id_setor) : null;
  }
}