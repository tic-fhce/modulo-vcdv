import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/materiaExtra/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/materiaExtra/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/materiaExtra/listar-carrera-year", datos)
    }
}