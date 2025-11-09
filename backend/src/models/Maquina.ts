export class Maquina {
    private idMaquina: number;
    private nome: string;
    private marca: string;
    private numeroSerie: string;
    private modelo: string | null;
    private tag: string | null;
    private producaoHora: number;
    private idSetor: number;

    constructor(idMaquina: number, nome: string, marca: string, numeroSerie: string,
        modelo: string | null, tag: string | null, producaoHora: number, idSetor: number
    ) {
        this.idMaquina = idMaquina;
        this.nome = nome;
        this.marca = marca;
        this.numeroSerie = numeroSerie;
        this.modelo = modelo;
        this.tag = tag;
        this.producaoHora = producaoHora;
        this.idSetor = idSetor;
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

    public get getProducaoHora(): number {
        return this.producaoHora;
    }
    public set setProducaoHora(producaoHora: number) {
        this.producaoHora = producaoHora; 
    }

    public get getIdSetor(): number {
        return this.idSetor;
    }
    public set setIdSetor(idSetor: number) {
        this.idSetor = idSetor; 
    }
}