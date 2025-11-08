export class Estado {
    private idEstado: number;
    private codigo: number;
    private status: string;

    constructor(data: {id_estado: number, codigo: number, status: string}) {
        this.idEstado = data.id_estado;
        this.codigo = data.codigo;
        this.status = data.status;
    }

    public get getIdEstado(): number {
        return this.idEstado;
    }
    public set setIdEstado(idEstado: number) {
        this.idEstado = idEstado; 
    }

    public get getCodigo(): number {
        return this.codigo;
    }
    public set setCodigo(codigo: number) {
        this.codigo = codigo; 
    }

    public get getStatus(): string {
        return this.status;
    }
    public set setStatus(status: string) {
        this.status = status; 
    }
}