export class Cargo {
    private idCargo: number;
    private codigo: number;
    private cargo: string;
    private descricao: string | null;

    constructor(idCargo: number, codigo: number, cargo: string, descricao: string | null) {
        this.idCargo = idCargo;
        this.codigo = codigo;
        this.cargo = cargo;
        this.descricao = descricao;
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