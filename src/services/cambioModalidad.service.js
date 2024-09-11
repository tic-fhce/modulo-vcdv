import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/cambioModalidad/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/cambioModalidad/obtener", datos)
    },
    obtenerFila(datos){
        return Api().post("/api/cambioModalidad/obtenerFila", datos)
    }
}