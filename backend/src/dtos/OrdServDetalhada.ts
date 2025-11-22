export class OrdServDetalhada {
    private idOrdServ: number;
    private descricao: string;
    private solucao: string | null;
    private dataAbertura: string;
    private dataInicio: string | null;
    private dataTermino: string | null;
    private operacao: boolean;
    private custo: number | null;
    private idUsuario: number | null;
    private nomeUsuario: string | null;
    private idEstado: number;
    private codigo: number;
    private status: string;
    private idMaquina: number;
    private nomeMaquina: string;
    private numeroSerie: string;
    private idSetor: number;
    private setor: string;

    constructor(data: {id_ord_serv: number, descricao: string, solucao: string | null, 
        data_abertura: string, data_inicio: string | null, data_termino: string | null, operacao: boolean,
        custo: number | null, id_usuario: number | null, nome_usuario: string | null, id_estado: number,
        codigo: number, status: string, id_maquina: number, nome_maquina: string, numero_serie: string,
        id_setor: number, setor: string
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
        this.nomeUsuario = data.nome_usuario;
        this.idEstado = data.id_estado;
        this.codigo = data.codigo;
        this.status = data.status;
        this.idMaquina = data.id_maquina;
        this.nomeMaquina = data.nome_maquina;
        this.numeroSerie = data.numero_serie;
        this.idSetor = data.id_setor;
        this.setor = data.setor;
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
}