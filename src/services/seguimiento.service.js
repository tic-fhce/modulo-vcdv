import { Api } from "./api.service";

export default {
    listarTramite(){
        return Api().get("/api/tramite/listar");
    },
    listarSeguimientoTramite(){
        return Api().post("/api/tramite/listarSeguimientoTramite")
    },
    listar(){
        return Api().get("/api/seguimiento/listar");
    },
    listTramitePendiente(){
        return Api().get("/api/seguimiento/tramitePendiente");
    },
    listTramiteConcluido(){
        return Api().get("/api/seguimiento/tramiteConcluido");
    },
    quitarTramiteLista(datos){
        return Api().post("/api/seguimiento/quitarTramite", datos);
    }
}