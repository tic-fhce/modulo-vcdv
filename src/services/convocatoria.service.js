import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/convocatoria/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/convocatoria/obtener", datos)
    }
}