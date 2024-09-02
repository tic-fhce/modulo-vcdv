import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/concursoDocInterinos/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/concursoDocInterinos/obtener", datos)
    }
}