import { Maquina } from "../models/Maquina";
import { MaquinaDetalhada } from "../dtos/MaquinaDetalhada";
import { db } from "../config/db";

export class MaquinaRepository {
<<<<<<< HEAD
  //Pega todas as máquinas do banco com informações do setor
  async getAllMaquinas(): Promise<MaquinaDetalhada[]> {
    const [rows] = await db.execute(
      "SELECT m.id_maquina, m.nome, m.marca, m.modelo, m.numero_serie, m.tag, m.producaoPorHora as producaoPorHora, s.id_setor, s.setor, s.descricao FROM maquina as m INNER JOIN setor as s ON m.id_setor = s.id_setor"
    );
    return (rows as any[]).map((row) => new MaquinaDetalhada(row));
  }

  async findById(idMaquina: number): Promise<MaquinaDetalhada | null> {
    const [rows] = await db.execute(
      "SELECT m.id_maquina, m.nome, m.marca, m.modelo, m.numero_serie, m.tag, m.producaoPorHora as producaoPorHora, s.id_setor, s.setor, s.descricao FROM maquina as m INNER JOIN setor as s ON m.id_setor = s.id_setor WHERE m.id_maquina = ?",
      [idMaquina]
    );
    const row = (rows as any[])[0];
    return row ? new MaquinaDetalhada(row) : null;
  }

  async createMaquina(
    nome: string,
    marca: string,
    numeroSerie: string,
    modelo: string | null,
    tag: string | null,
    producaoPorHora: number,
    idSetor: number
  ): Promise<Maquina> {
    const [result]: any = await db.execute(
      "INSERT INTO maquina (nome, marca, modelo, numero_serie, tag, producaoPorHora, id_setor) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nome, marca, modelo, numeroSerie, tag, producaoPorHora, idSetor]
    );
    const newId = result.insertId;
    return new Maquina({
      id_maquina: newId,
      nome,
      marca,
      numero_serie: numeroSerie,
      modelo,
      tag,
      producaoPorHora,
      id_setor: idSetor,
    });
  }

  async updateMaquina(
    idMaquina: number,
    nome: string,
    marca: string,
    numeroSerie: string,
    modelo: string | null,
    tag: string | null,
    producaoPorHora: number,
    idSetor: number
  ): Promise<boolean> {
    const [result]: any = await db.execute(
      "UPDATE maquina SET nome = ?, marca = ?, modelo = ?, numero_serie = ?, tag = ?, producaoPorHora = ?, id_setor = ? WHERE id_maquina = ?",
      [
        nome,
        marca,
        modelo,
        numeroSerie,
        tag,
        producaoPorHora,
        idSetor,
        idMaquina,
      ]
    );
    return result.affectedRows > 0;
  }
=======
    //Pega todas as máquinas do banco com informações do setor
    async getAllMaquinas(): Promise<MaquinaDetalhada[]> {
        const [rows] = await db.execute(
        'SELECT m.id_maquina, m.nome, m.marca, m.modelo, m.numero_serie, m.tag, m.producao_hora, m.disponibilidade_mes, s.id_setor, s.setor, s.descricao FROM maquina as m INNER JOIN setor as s ON m.id_setor = s.id_setor'
        );
        return (rows as any[]).map(row => new MaquinaDetalhada(row));
    }

    async findById(idMaquina: number): Promise<MaquinaDetalhada | null> {
        const [rows] = await db.execute(
        'SELECT m.id_maquina, m.nome, m.marca, m.modelo, m.numero_serie, m.tag, m.producao_hora, m.disponibilidade_mes, s.id_setor, s.setor, s.descricao FROM maquina as m INNER JOIN setor as s ON m.id_setor = s.id_setor WHERE s.id_setor = ?', [idMaquina]
        );
        const row = (rows as any[])[0];
        return row ? new MaquinaDetalhada(row): null;
    }

    async createMaquina(nome: string, marca: string, numeroSerie: string, modelo: string | null, 
        tag: string | null, producaoHora: number | null, disponibilidadeMes: number,
        idSetor: number): Promise<Maquina> {
        const [result]: any = await db.execute(
            'INSERT INTO maquina (nome, marca, modelo, numero_serie, tag, producao_hora, disponibilidade_mes, id_setor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [nome, marca, modelo, numeroSerie, tag, producaoHora, disponibilidadeMes, idSetor]
        );
        const newId = result.insertId;
        return new Maquina({
            id_maquina: newId, nome, marca, numero_serie: numeroSerie, modelo, tag, 
            producao_hora: producaoHora, disponibilidade_mes: disponibilidadeMes, id_setor: idSetor
        });
    }

    async updateMaquina(
        idMaquina: number, nome: string, marca: string, numeroSerie: string, modelo: string | null,
        tag: string | null, producaoHora: number | null, disponibilidadeMes: number,
        idSetor: number): Promise<boolean> {
        const [result]: any = await db.execute(
            'UPDATE maquina SET nome = ?, marca = ?, modelo = ?, numero_serie = ?, tag = ?, producao_hora = ?, disponibilidade_mes = ?, id_setor = ? WHERE id_maquina = ?',
            [nome, marca, modelo, numeroSerie, tag, producaoHora, disponibilidadeMes, idSetor, idMaquina]
        );
        return result.affectedRows > 0;
    }
>>>>>>> bf5e741c0c10f3fcbb06dac7cfbda4bc32733e47

  async deleteMaquina(idMaquina: number): Promise<boolean> {
    const [result]: any = await db.execute(
      "DELETE FROM maquina WHERE id_maquina = ?",
      [idMaquina]
    );
    return result.affectedRows > 0;
  }
}
