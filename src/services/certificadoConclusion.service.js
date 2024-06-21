import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/certificadoConclusion/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/certificadoConclusion/obtener", datos)
    }
}