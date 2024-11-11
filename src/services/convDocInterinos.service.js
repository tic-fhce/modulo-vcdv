import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/conv-doc-interinos/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/conv-doc-interinos/obtener", datos)
    },
    crearConvocatoria(datos){
        return Api().post("/conv-doc-interinos/crear", datos)
    },
    obtenerConvocatoria(nrotramite){
        return Api().post("/conv-doc-interinos/obtenerC", nrotramite)
    }

}