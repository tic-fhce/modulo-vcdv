import { Api } from "./apiDrive.service"

export default {
    cargarDocumento(datos){
        return Api().post("/upload", datos);
    },
    eliminarDocumento(cod){
        return Api().delete("/delete/"+cod)
    },
    urlDocumento(cod){
        return Api().get("/share/"+cod)
    },
    downloadDocumento(datos){
        return Api().get("/download"+datos)
    },
    recuperarDocumento(cod){
        return Api().post("/download-and-send", cod, {responseType: 'blob'})
    }
}