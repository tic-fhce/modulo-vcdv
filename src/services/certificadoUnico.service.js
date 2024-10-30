import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/certificadoUnico/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/certificadoUnico/obtener", datos)
    },
    listarCarreraYear(datos){
        return Api().post("/certificadoUnico/listar-carrera-year", datos)
    }
}