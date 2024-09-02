import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/designacionDocInterinos/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/designacionDocInterinos/obtener", datos)
    }
}