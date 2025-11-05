export class Setor {
    private idSetor: number;
    private nomeSetor: string;
    private descricao: string;

    constructor(idSetor: number, nomeSetor: string, descricao: string) {
        this.idSetor = idSetor;
        this.nomeSetor = nomeSetor;
        this.descricao = descricao;
    }

    public get getIdSetor(): number {
        return this.idSetor;
    }
    public set setIdSetor(idSetor: number) {
        this.idSetor = idSetor; 
    }

    public get getNomeSetor(): string {
        return this.nomeSetor;
    }
    public set setNomeSetor(nomeSetor: string) {
        this.nomeSetor = nomeSetor; 
    }

    public get getDescricao(): string {
        return this.descricao;
    }
    public set setDescricao(descricao: string) {
        this.descricao = descricao; 
    }
}