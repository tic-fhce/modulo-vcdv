import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/convalidacion02/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/convalidacion02/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/convalidacion02/listar-carrera-year", datos)
    }
}