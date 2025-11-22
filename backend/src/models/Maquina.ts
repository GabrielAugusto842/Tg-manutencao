export class Maquina {
    private idMaquina: number;
    private nome: string;
    private marca: string;
    private numeroSerie: string;
    private modelo: string | null;
    private tag: string | null;
    private producaoHora: number | null;
    private disponibilidadeMes: number;
    private idSetor: number;

    constructor(data: {id_maquina: number, nome: string, marca: string, numero_serie: string,
        modelo: string | null, tag: string | null, producao_hora: number | null, 
        disponibilidade_mes: number, id_setor: number
    }) {
        this.idMaquina = data.id_maquina;
        this.nome = data.nome;
        this.marca = data.marca;
        this.numeroSerie = data.numero_serie;
        this.modelo = data.modelo;
        this.tag = data.tag;
        this.producaoHora = data.producao_hora;
        this.disponibilidadeMes = data.disponibilidade_mes;
        this.idSetor = data.id_setor;
    }

    public get getIdMaquina(): number {
        return this.idMaquina;
    }
    public set setIdMaquina(idMaquina: number) {
        this.idMaquina = idMaquina; 
    }

    public get getNome(): string {
        return this.nome;
    }
    public set setNome(nome: string) {
        this.nome = nome; 
    }

    public get getMarca(): string {
        return this.marca;
    }
    public set setMarca(marca: string) {
        this.marca = marca; 
    }
    
    public get getNumeroSerie(): string {
        return this.numeroSerie;
    }
    public set setNumeroSerie(numeroSerie: string) {
        this.numeroSerie = numeroSerie; 
    }

    public get getModelo(): string | null {
        return this.modelo;
    }
    public set setModelo(modelo: string) {
        this.modelo = modelo; 
    }

    public get getTag(): string | null {
        return this.tag;
    }
    public set setTag(tag: string) {
        this.tag = tag; 
    }

    public get getProducaoHora(): number | null {
        return this.producaoHora;
    }
    public set setProducaoHora(producaoHora: number) {
        this.producaoHora = producaoHora; 
    }

    public get getDisponibilidadeMes(): number {
        return this.disponibilidadeMes;
    }
    public set setDisponibilidadeMes(disponibilidadeMes: number) {
        this.disponibilidadeMes = disponibilidadeMes; 
    }

    public get getIdSetor(): number {
        return this.idSetor;
    }
    public set setIdSetor(idSetor: number) {
        this.idSetor = idSetor; 
    }
}