import { Api } from "./api.service"

export default {
    crearAprobaciónPerfil(datos){
        return Api().post("/aprobacionPerfil/crear", datos)
    },
    obtenerAprobacionPerfil(nrotramite){
        return Api().post("/aprobacionPerfil/obtenerAP", nrotramite)
    },
    obtenerUltimaAprobacionPerfil(){
        return Api().post("/aprobacionPerfil/obtenerUAP")
    },
    actulizarColumna(datos){
        return Api().patch("/aprobacionPerfil/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/aprobacionPerfil/obtener", datos)
    },
    listar(){
        return Api().get("/aprobacionPerfil/listar")
    },
    listarCarreraYear(datos){
        return Api().post("/aprobacionPerfil/listar-carrera-year", datos)
    }
}