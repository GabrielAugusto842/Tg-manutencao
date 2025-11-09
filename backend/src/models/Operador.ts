import { Usuario } from "./Usuario";

export class Operador extends Usuario {
    public visualizarOS(idSetor: number) {
        console.log("IdSetor = " + idSetor);
    }

    public criarOS(descricao: string, idMaquina: number) {
        console.log("Descrição = " + descricao);
        console.log("idMaquina = " + idMaquina);
    }

    public excluirOS(idOrdServ: number) {
        console.log("IdOrdServ = " + idOrdServ);
    }
}