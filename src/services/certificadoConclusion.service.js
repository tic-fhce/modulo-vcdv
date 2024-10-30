import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/certificadoConclusion/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/certificadoConclusion/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/certificadoConclusion/listar-carrera-year", datos)
    }
}