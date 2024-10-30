import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/convalidacion01/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/convalidacion01/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/convalidacion01/listar-carrera-year", datos)
    }
}