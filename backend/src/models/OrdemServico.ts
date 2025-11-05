export class OrdemServico {
    private idOrdServ: number;
    private descricao: string;
    private dataInicio: string;
    private dataTermino: string;
    private custo: number | null;
    private idUsuario: number | null; //id do manutentor
    private codigoEstado: number;
    private idMaquina: number;

    constructor(idOrdServ: number, descricao: string, dataInicio: string, dataTermino: string,
        custo: number | null, idUsuario: number | null, codigoEstado: number, idMaquina: number
    ) {
        this.idOrdServ = idOrdServ;
        this.descricao = descricao;
        this.dataInicio = dataInicio;
        this.dataTermino = dataTermino;
        this.custo = custo;
        this.idUsuario = idUsuario;
        this.codigoEstado = codigoEstado;
        this.idMaquina = idMaquina;
    }

    public get getIdOrdServ(): number {
        return this.idOrdServ;
    }
    public set setIdOrdServ(idOrdServ: number) {
        this.idOrdServ = idOrdServ; 
    }

    public get getDescricao(): string {
        return this.descricao;
    }
    public set setDescricao(descricao: string) {
        this.descricao = descricao; 
    }

    public get getDataInicio(): string {
        return this.dataInicio;
    }
    public set setDataInicio(dataInicio: string) {
        this.dataInicio = dataInicio; 
    }
    
    public get getDataTermino(): string {
        return this.dataTermino;
    }
    public set setDataTermino(dataTermino: string) {
        this.dataTermino = dataTermino; 
    }

    public get getCusto(): number | null {
        return this.custo;
    }
    public set setCusto(custo: number) {
        this.custo = custo; 
    }

    public get getIdUsuario(): number | null {
        return this.idUsuario;
    }
    public set setIdUsuario(idUsuario: number) {
        this.idUsuario = idUsuario; 
    }

    public get getCodEstado(): number {
        return this.codigoEstado;
    }
    public set setCodEstado(codigoEstado: number) {
        this.codigoEstado = codigoEstado; 
    }

    public get getIdMaquina(): number {
        return this.idMaquina;
    }
    public set setIdMaquina(idMaquina: number) {
        this.idMaquina = idMaquina; 
    }
}