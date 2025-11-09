import { Usuario } from "./Usuario";

export class Manutentor extends Usuario {
    public visualizarOS() {
        console.log("Ordem de serviço!");
    }

    public aceitarOS(idOrdServ: number, idEstado: number, idUsuario: number) {
        console.log("IdOrdServ = " + idOrdServ);
        console.log("idEstado = " + idEstado);
        console.log("idUsuario = " + idUsuario);
    }

    public finalizarOS(idOrdServ: number, idEstado: number, dataTermino: string, custo: number | null) {
        console.log("IdOrdServ = " + idOrdServ);
        console.log("idEstado = " + idEstado);
        console.log("dataTermino = " + dataTermino);
        console.log("custo = " + custo);
    }
}