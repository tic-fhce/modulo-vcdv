import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/cambioModalidad/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/cambioModalidad/obtener", datos)
    },
    obtenerFila(datos){
        return Api().post("/cambioModalidad/obtenerFila", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/cambioModalidad/listar-carrera-year", datos)
    }
}