import { Api } from "./apiAdsib.service";

export default {
    ListarToken() {
        return Api().get("/token/connected");
    },
    ListarCertificados(datos){
        return Api().post("/token/data", datos);
    },
    FirmarDocumentos(datos){
        return Api().post("/token/firmar_lote_pdfs", datos);
    },
    ValidarDocumento(document){
        return Api().post("/validar_pdf", document)
    }
}