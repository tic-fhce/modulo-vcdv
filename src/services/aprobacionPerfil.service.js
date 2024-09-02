import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/aprobacionPerfil/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/aprobacionPerfil/obtener", datos)
    }
}