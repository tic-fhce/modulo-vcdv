import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/materiaExtra/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/materiaExtra/obtener", datos)
    }
}