import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/conv-doc-contratados/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/conv-doc-contratados/obtener", datos)
    },
    crearConvocatoria(datos){
        return Api().post("/conv-doc-contratados/crear", datos)
    },
    obtenerConvocatoria(nrotramite){
        return Api().post("/conv-doc-contratados/obtenerC", nrotramite)
    }

}