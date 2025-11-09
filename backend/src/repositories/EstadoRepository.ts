import { Estado } from "../models/Estado";
import { db } from "../config/db";

export class EstadoRepository {
    //Pega todos os estados de OS do banco
    async getAllEstados(): Promise<Estado[]> {
        const [rows] = await db.execute('SELECT id_estado, codigo, status FROM estado');
        return (rows as any[]).map(row => new Estado(row));
    }
}