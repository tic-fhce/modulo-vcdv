import { Api } from "./api.service"

export default {
    guardarDocumentos(datos){
        return Api().post("/api/documento/subir", datos)
    },
    recuperarDocumentos(datos){
        return Api().post("/api/documento/recuperar", datos, {responseType: 'blob'})
    },
    observacionDocumentos(datos){
        return Api().post("/api/documento/observacionDocumento", datos)
    },
    actualizarobservacionDocumentos(datos){
        return Api().post("/api/documento/actualizarObservacion", datos)
    },
    pdfcompress(datos){
        return Api().post("/api/pdf/compress", datos)
    }
}