export class Cargo {
    private idCargo: number;
    private codigo: number;
    private cargo: string;
    private descricao: string | null;

    constructor(data: {id_cargo: number, codigo: number, cargo: string, descricao: string | null}) {
        this.idCargo = data.id_cargo;
        this.codigo = data.codigo;
        this.cargo = data.cargo;
        this.descricao = data.descricao;
    }

    public get getIdCargo(): number {
        return this.idCargo;
    }
    public set setIdCargo(idCargo: number) {
        this.idCargo = idCargo; 
    }

    public get getCodigo(): number {
        return this.codigo;
    }
    public set setCodigo(codigo: number) {
        this.codigo = codigo; 
    }

    public get getCargo(): string {
        return this.cargo;
    }
    public set setCargo(cargo: string) {
        this.cargo = cargo; 
    }

    public get getDescricao(): string | null {
        return this.descricao;
    }
    public set setDescricao(descricao: string) {
        this.descricao = descricao; 
    }
}