import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/convalidacion01/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/convalidacion01/obtener", datos)
    }
}