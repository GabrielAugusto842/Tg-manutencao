import { Cargo } from "../models/Cargo";
import { db } from "../config/db";

export class CargoRepository {
    //Pega todos os cargos do banco
    async getAllCargos(): Promise<Cargo[]> {
        const [rows] = await db.execute('SELECT id_cargo, codigo, cargo, descricao FROM cargo');
        return (rows as any[]).map(row => new Cargo(row));
    }
}