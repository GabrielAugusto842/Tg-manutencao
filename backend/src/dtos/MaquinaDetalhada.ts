export class MaquinaDetalhada {
    private idMaquina: number;
    private nome: string;
    private marca: string;
    private numeroSerie: string;
    private modelo: string | null;
    private tag: string | null;
    private producaoHora: number;
    private idSetor: number;
    private setor: string;
    private descricao: string;

    constructor(data: {id_maquina: number, nome: string, marca: string, numero_serie: string,
        modelo: string | null, tag: string | null, producaoPorHora: number, 
        id_setor: number, setor: string, descricao: string
    }) {
        this.idMaquina = data.id_maquina;
        this.nome = data.nome;
        this.marca = data.marca;
        this.numeroSerie = data.numero_serie;
        this.modelo = data.modelo;
        this.tag = data.tag;
        this.producaoHora = data.producaoPorHora;
        this.idSetor = data.id_setor;
        this.setor = data.setor;
        this.descricao = data.descricao;
    }
}