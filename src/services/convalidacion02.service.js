import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/convalidacion02/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/convalidacion02/obtener", datos)
    }
}