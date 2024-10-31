import { Api } from "./api.service";

export default {
    listarTramite(){
        return Api().get("/api/tramite/listar");
    },
    listarSeguimientoTramite(){
        return Api().post("/api/tramite/listarSeguimientoTramite")
    },
    listar(){
        return Api().get("/seguimiento/listar");
    },
    listTramitePendiente(){
        return Api().get("/seguimiento/tramitePendiente");
    },
    listTramiteConcluido(){
        return Api().get("/seguimiento/tramiteConcluido");
    },
    listHojaRutaAtendidas(){
        return Api().get("/seguimiento/hojarutaAtendida");
    },
    countTramitesPendientes(){
        return Api().get("/seguimiento/countTramitesPendientes");
    },
    countTramitesConcluidos(){
        return Api().get("/seguimiento/countTramitesConcluidos");
    },
    activarVisto(datos){
        return Api().post("/seguimiento/visto", datos);
    }
}