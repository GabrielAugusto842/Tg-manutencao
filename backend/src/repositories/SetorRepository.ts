import { Setor } from "../models/Setor";
import { db } from "../config/db";

export class SetorRepository {
    //Pega todos os setores do banco
    async getAllSetores(): Promise<Setor[]> {
        const [rows] = await db.execute('SELECT id_setor, setor, descricao FROM setor');
        return (rows as any[]).map(row => new Setor(row));
    }

    async findById(id: number): Promise<Setor | null> {
        const [rows] = await db.execute(
            'SELECT id_setor, setor, descricao FROM setor WHERE id_setor = ?', [id]
        );
        const row = (rows as any[])[0];
        return row ? new Setor(row): null;
    }

    async createSetor(nomeSetor: string, descricao: string | null): Promise<Setor> {
        const [result]: any = await db.execute(
            'INSERT INTO setor (setor, descricao) VALUES (?, ?)', [nomeSetor, descricao]
        );
        const newId = result.insertId;
        return new Setor({id_setor: newId, setor: nomeSetor, descricao});
    }

    async updateSetor(idSetor: number, nomeSetor: string, descricao: string | null): Promise<boolean> {
        const [result]: any = await db.execute(
            'UPDATE setor SET setor = ?, descricao = ? WHERE id_setor = ?',
            [nomeSetor, descricao, idSetor]
        );
        return result.affectedRows > 0;
    }

    async deleteSetor(idSetor: number): Promise<boolean> {
        const [result]: any = await db.execute(
            'DELETE FROM setor WHERE id_setor = ?', [idSetor]
        );
        return result.affectedRows > 0;
    }
}