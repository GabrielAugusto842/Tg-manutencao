export class OrdemServico {
    private idOrdServ: number;
    private descricao: string;
    private solucao: string | null;
    private dataAbertura: string;
    private dataInicio: string | null;
    private dataTermino: string | null;
    private operacao: boolean;
    private custo: number | null;
    private idUsuario: number | null; //id do manutentor
    private idEstado: number;
    private idMaquina: number;

    constructor(data: {id_ord_serv: number, descricao: string, solucao: string | null, 
        data_abertura: string, data_inicio: string | null, data_termino: string | null, operacao: boolean,
        custo: number | null, id_usuario: number | null, id_estado: number, id_maquina: number
    }) {
        this.idOrdServ = data.id_ord_serv;
        this.descricao = data.descricao;
        this.solucao = data.solucao;
        this.dataAbertura = data.data_abertura;
        this.dataInicio = data.data_inicio;
        this.dataTermino = data.data_termino;
        this.operacao = data.operacao;
        this.custo = data.custo;
        this.idUsuario = data.id_usuario;
        this.idEstado = data.id_estado;
        this.idMaquina = data.id_maquina;
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

    public get getSolucao(): string | null {
        return this.solucao;
    }
    public set setSolucao(solucao: string) {
        this.solucao = solucao; 
    }

    public get getDataAbertura(): string {
        return this.dataAbertura;
    }
    public set setDataAbertura(dataAbertura: string) {
        this.dataAbertura = dataAbertura; 
    }

    public get getDataInicio(): string | null {
        return this.dataInicio;
    }
    public set setDataInicio(dataInicio: string) {
        this.dataInicio = dataInicio; 
    }
    
    public get getDataTermino(): string | null {
        return this.dataTermino;
    }
    public set setDataTermino(dataTermino: string) {
        this.dataTermino = dataTermino; 
    }

    public get getOperacao(): boolean {
        return this.operacao;
    }
    public set setOperacao(operacao: boolean) {
        this.operacao = operacao; 
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

    public get getIdEstado(): number {
        return this.idEstado;
    }
    public set setIdEstado(idEstado: number) {
        this.idEstado = idEstado; 
    }

    public get getIdMaquina(): number {
        return this.idMaquina;
    }
    public set setIdMaquina(idMaquina: number) {
        this.idMaquina = idMaquina; 
    }
}