import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/certificadoUnico/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/certificadoUnico/obtener", datos)
    }
}