import { Api } from "./apiDrive.service";

export default {
    editarDocumento(datos){
        return Api().post("/generate-document", datos, {responseType: 'blob'});
    },
    recuperarDocumento(id){
        return Api().get("/get-document/" + id, {responseType: 'blob'})
    },
}