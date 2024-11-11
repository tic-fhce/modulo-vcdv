import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/conv-aux-docencia/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/conv-aux-docencia/obtener", datos)
    },
    crearConvocatoria(datos){
        return Api().post("/conv-aux-docencia/crear", datos)
    },
    obtenerConvocatoria(nrotramite){
        return Api().post("/conv-aux-docencia/obtenerC", nrotramite)
    }

}