import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/alumnoLibre/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/alumnoLibre/obtener", datos)
    }
}