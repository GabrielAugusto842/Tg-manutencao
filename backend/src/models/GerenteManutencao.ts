import { Usuario } from "./Usuario";

export class GerenteManutencao extends Usuario {
    public visualizarOS() {
        console.log("Ordem de serviço!");
    }

    public alterarOS(idOrdServ: number, idEstado: number, descricao: string, custo: number) {
        console.log("IdOrdServ = " + idOrdServ);
        console.log("idEstado = " + idEstado);
        console.log("descricao = " + descricao);
        console.log("custo = " + custo);
    }

    public excluirOS(idOrdServ: number) {
        console.log("IdOrdServ = " + idOrdServ);
    }

    public GerarRelatorio() {
        console.log("Relatório");
    }
}