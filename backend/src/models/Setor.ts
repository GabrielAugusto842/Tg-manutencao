export class Setor {
    private idSetor: number;
    private nomeSetor: string;
    private descricao: string | null;

    constructor(data: {id_setor: number, setor: string, descricao: string | null}) {
        this.idSetor = data.id_setor;
        this.nomeSetor = data.setor;
        this.descricao = data.descricao;
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

    public get getDescricao(): string | null {
        return this.descricao;
    }
    public set setDescricao(descricao: string) {
        this.descricao = descricao; 
    }
}