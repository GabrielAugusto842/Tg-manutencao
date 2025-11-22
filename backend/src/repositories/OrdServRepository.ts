import { OrdemServico } from "../models/OrdemServico";
import { EstadoRepository } from "./EstadoRepository";
import { OrdServDetalhada } from "../dtos/OrdServDetalhada";
import { db } from "../config/db";
import { getCurrentDateTime } from "../utils/dateUtils";

export class OrdServRepository {
    //ao chamar a classe, deve passar o estado
    //É implementado para pegar o id do estado com base no código 1 "aberto"
    constructor(private estadoRepo: EstadoRepository) {}

    //Pega todas as OS do banco com informações da máquina, usuário, estado e setor
    //Utilizada por Operador e Gerente de Manutenção
    async getAllOrdServ(): Promise<OrdServDetalhada[]> {
        const [rows] = await db.execute(
        'SELECT * FROM os_detalhada'
        );
        return (rows as any[]).map(row => new OrdServDetalhada(row));
    }

    //Lista as OS aceitas pelo usuário
    /*async getByUsuario(idUsuario: number): Promise<OrdServDetalhada[]> {
        const [rows] = await db.execute(
        `SELECT os.id_ord_serv, os.descricao, os.solucao, os.data_abertura, os.data_inicio, 
        os.data_termino, os.operacao, os.custo, u.id_usuario, u.nome AS nome_usuario, e.id_estado, 
        e.codigo, e.status, m.id_maquina, m.nome AS nome_maquina, m.numero_serie, s.id_setor, s.setor 
        FROM ordem_servico AS os INNER JOIN usuario AS u ON os.id_usuario = u.id_usuario
        INNER JOIN estado AS e ON os.id_estado = e.id_estado
        INNER JOIN maquina AS m ON os.id_maquina = m.id_maquina
        INNER JOIN setor AS s ON m.id_setor = s.id_setor
        WHERE u.id_usuario = ?`, [idUsuario]
        );
        return (rows as any[]).map(row => new OrdServDetalhada(row));
    }*/

    //Listar todas as ordens em aberto
    async getOSAbertas(): Promise<OrdServDetalhada[]> {
        const [rows] = await db.execute(
        'SELECT * FROM os_abertas'
        );
        return (rows as any[]).map(row => new OrdServDetalhada(row));
    }

    async findById(idOrdServ: number): Promise<OrdServDetalhada | null> {
        const [rows] = await db.execute(
        `SELECT os.id_ord_serv, os.descricao, os.solucao, os.data_abertura, os.data_inicio, 
        os.data_termino, os.operacao, os.custo, u.id_usuario, u.nome AS nome_usuario, e.id_estado, 
        e.codigo, e.status, m.id_maquina, m.nome AS nome_maquina, m.numero_serie, s.id_setor, s.setor 
        FROM ordem_servico AS os 
        LEFT JOIN usuario AS u ON os.id_usuario = u.id_usuario
        INNER JOIN estado AS e ON os.id_estado = e.id_estado
        INNER JOIN maquina AS m ON os.id_maquina = m.id_maquina
        INNER JOIN setor AS s ON m.id_setor = s.id_setor
        WHERE id_ord_serv = ?`, [idOrdServ]
        );
        const row = (rows as any[])[0];
        return row ? new OrdServDetalhada(row): null;
    }

    async createOrdServ(descricao: string, operacao: boolean, idMaquina: number): Promise<OrdemServico> {
        //Primeiro busca o id equivalente ao código 1 (aberta) no banco
        const estadoAberto = await this.estadoRepo.getByCodigo(1);
        if (!estadoAberto) {
            throw new Error("Estado de OS aberta não configurado no sistema");
        }
        const idEstado = estadoAberto.getIdEstado;

        //Depois, pega a data e horário atual
        const dataAbertura = getCurrentDateTime();
        console.log(dataAbertura);

        const [result]: any = await db.execute(
            `INSERT INTO ordem_servico (descricao, data_abertura, operacao, id_estado, id_maquina) 
            VALUES (?, ?, ?, ?, ?)`, 
            [descricao, dataAbertura, Number(operacao), idEstado, idMaquina]
        );
        const newId = result.insertId;
        return new OrdemServico({
            id_ord_serv: newId, descricao, solucao: null, data_abertura: dataAbertura, data_inicio: null,
            data_termino: null, operacao, custo: null, id_usuario: null, id_estado: idEstado, 
            id_maquina: idMaquina
        });
    }

    //Função para o Gerente de Manutenção atualizar as OS
    async updateOrdemServico(
        idOrdServ: number, descricao: string, solucao: string | null, custo: number | null,
        idUsuario:number | null): Promise<boolean> {
        //Primeiramente, busca a OS no banco
        const os = await this.findById(idOrdServ);
        if (!os) {
            throw new Error('Ordem de serviço não encontrada!');
        }

        //Depois, busca o id de cada estado (Aberto, Em andamento e Finalizado) pelo código
        const estadoAberto = await this.estadoRepo.getByCodigo(1);
        const estadoAndamento = await this.estadoRepo.getByCodigo(2);
        const estadoFinalizado = await this.estadoRepo.getByCodigo(3);
        if (!estadoAberto || !estadoAndamento || !estadoFinalizado) {
            throw new Error("Estado de OS não configurados no sistema");
        }

        // Monta dinamicamente a query com os campos fornecidos
        const fields: string[] = [];
        const values: any[] = [];

        if (os.getIdEstado == estadoAberto.getIdEstado) {
            if (descricao !== undefined) {
                fields.push('descricao = ?');
                values.push(descricao);
            }
            if (idUsuario !== undefined) {
                fields.push('id_usuario = ?');
                values.push(idUsuario);
                const idEstado = estadoAndamento.getIdEstado;
                fields.push('id_estado = ?');
                values.push(idEstado);
                const operacao = false;
                fields.push('operacao = ?');
                values.push(Number(operacao));
                const dataInicio = getCurrentDateTime();
                fields.push('data_inicio = ?');
                values.push(dataInicio);
            }
            
        } else if (os.getIdEstado == estadoAndamento.getIdEstado) {
            if (descricao !== undefined) {
                fields.push('descricao = ?');
                values.push(descricao);
            }
            if (idUsuario !== undefined) {
                fields.push('id_usuario = ?');
                values.push(idUsuario);
            }
        } else if(os.getIdEstado == estadoFinalizado.getIdEstado) {
            if (solucao !== undefined) {
                fields.push('solucao = ?');
                values.push(solucao);
            }
            if (custo !== undefined) {
                fields.push('custo = ?');
                values.push(custo);
            }
            values.push(idOrdServ);
        } else {
            throw new Error("Estado passado não consta no sistema!");
        }
        if (fields.length === 0) {
            console.log("Nada para atualizar");
            return false; // nada para atualizar
        }
        values.push(idOrdServ);
        const sql = `UPDATE ordem_servico SET ${fields.join(', ')} WHERE id_ord_serv = ?`;
        const [result]: any = await db.execute(sql, values);
        return result.affectedRows > 0;
    }

    //Função do manutentor aceitar OS
    /*async aceitarOrdemServico(idOrdServ: number, idUsuario:number): Promise<boolean> {
        //Primeiramente, busca a OS no banco
        const os = await this.findById(idOrdServ);
        if (!os) {
            throw new Error('Ordem de serviço não encontrada!');
        } 

        //Pega os estados aberta e em andamento
        const estadoAberto = await this.estadoRepo.getByCodigo(1);
        const estadoAndamento = await this.estadoRepo.getByCodigo(2);
        if (!estadoAberto || !estadoAndamento) {
            throw new Error("Estados de OS não configurados no sistema");
        }

        //verifica se a OS está aberta para aceitar e se não pertence a ninguém
        if (os.getIdEstado !== estadoAberto.getIdEstado) {
            throw new Error("Essa Ordem de Serviço não pode ser aceita pois não está em aberto!");
        }
        if (os.getIdUsuario !== null) {
            throw new Error("Essa ordem de serviço já foi aceita por outro usuário!");
        }

        //Dados para atualizar
        const dataInicio = getCurrentDateTime();
        const idEstado = estadoAndamento.getIdEstado;
        const operacao = 0;

        //Faz a atualização no banco
        const [result]: any = await db.execute(
            `UPDATE ordem_servico SET data_inicio = ?, id_estado = ?, operacao = ?, id_usuario = ? 
            WHERE id_ord_serv = ?`, 
            [dataInicio, idEstado, operacao, idUsuario, idOrdServ]
        );
        return result.affectedRows > 0;
    }*/

    //Função do manutentor de finalizar OS
    async finalizarOrdemServico(idOrdServ: number, solucao: string, custo: number | null): Promise<boolean> {
        //Primeiramente, busca a OS no banco
        const os = await this.findById(idOrdServ);
        if (!os) {
            throw new Error('Ordem de serviço não encontrada!');
        } 

        //Pega os estados em andamento e finalizado
        const estadoAndamento = await this.estadoRepo.getByCodigo(2);
        const estadoFinalizado = await this.estadoRepo.getByCodigo(3);
        if (!estadoAndamento || !estadoFinalizado) {
            throw new Error("Estados de OS não configurados no sistema");
        }

        //verifica se a OS está em andamento para finalizar
        if (os.getIdEstado !== estadoAndamento.getIdEstado) {
            throw new Error("Essa Ordem de Serviço não pode ser finalizada pois não está em andamento!");
        }

        //Dados para atualizar
        const dataTermino = getCurrentDateTime();
        const idEstado = estadoFinalizado.getIdEstado;
        const operacao = 1;

        //Faz a atualização no banco
        const [result]: any = await db.execute(
            `UPDATE ordem_servico SET solucao = ?, data_termino = ?, id_estado = ?, operacao = ?, custo = ? 
            WHERE id_ord_serv = ?`, 
            [solucao, dataTermino, idEstado, operacao, custo, idOrdServ]
        );
        return result.affectedRows > 0;
    }

    //Apenas para Ordens de serviço erradas
    async deleteOrdServ(idOrdServ: number): Promise<boolean> {
        const [result]: any = await db.execute(
            'DELETE FROM ordem_servico WHERE id_ord_serv = ?', [idOrdServ]
        );
        return result.affectedRows > 0;
    }
}