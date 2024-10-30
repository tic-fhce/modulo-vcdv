import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/alumnoLibre/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/alumnoLibre/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/alumnoLibre/listar-carrera-year", datos)
    }
}