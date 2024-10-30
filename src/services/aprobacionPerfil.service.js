import { Api } from "./api.service"

export default {
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