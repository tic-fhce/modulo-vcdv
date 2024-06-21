import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/designacionTribunal/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/designacionTribunal/obtener", datos)
    }
}