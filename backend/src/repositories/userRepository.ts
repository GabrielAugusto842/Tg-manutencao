import { db } from "../config/db";
import { Usuario } from "../models/Usuario";

export class UserRepository {
  async updateUsuario(id: number, dados: Partial<Usuario>): Promise<void> {
    const camposAtualizados = Object.entries(dados)
      .map(([key, value]) => `${key} = ?`)
      .join(", ");

    const valores = Object.values(dados);

    // Se a senha estiver presente, ela será hasheada e passada aqui.
    const query = `UPDATE usuario SET ${camposAtualizados} WHERE id_usuario = ?`;

    await db.execute(query, [...valores, id]);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    const usuario = (rows as any)[0];
    return usuario
      ? new Usuario(
          usuario.id_usuario,
          usuario.nome,
          usuario.email,
          usuario.senha,
          usuario.id_cargo,
          usuario.id_setor
        )
      : null;
  }

  public async findById(id: number): Promise<Usuario | null> {
    const [rows] = await db.query(
      "SELECT * FROM usuario WHERE id_usuario = ?",
      [id]
    );
    const usuario = (rows as any)[0];
    return usuario
      ? new Usuario(
          usuario.id_usuario,
          usuario.nome,
          usuario.email,
          usuario.senha,
          usuario.id_cargo,
          usuario.id_setor
        )
      : null;
  }

  public async updatePassword(
    userId: number,
    newPasswordHash: string
  ): Promise<boolean> {
    try {
      const [result] = await db.execute(
        "UPDATE usuario SET senha = ? WHERE id_usuario = ?",
        [newPasswordHash, userId]
      );
      // Verifica se alguma linha foi afetada
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error("Erro no repositório ao atualizar senha:", error);
      return false;
    }
  }

  async createUsuario(usuario: Partial<Usuario>): Promise<any> {
    const { nome, email, senha, id_cargo, id_setor } = usuario;

    const sql = `
            INSERT INTO Usuario (nome, email, senha, id_cargo, id_setor)
            VALUES (?, ?, ?, ?, ?)
        `;
    const values = [nome, email, senha, id_cargo, id_setor];

    // Executa a query
    const [result] = await db.execute(sql, values);
    return result;
  }

  public async buscarManutentores(): Promise<Usuario[]> {
    const [rows] = await db.execute(
      "SELECT id_usuario, nome, email, id_cargo, id_setor FROM usuario WHERE id_cargo = 2"
    );
    return rows as Usuario[];
  }
}
