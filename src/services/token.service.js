import { Api } from "./apiAdsib.service";

export default {
    ListarToken() {
        return Api().get("/connected");
    },
    ListarCertificados(datos){
        return Api().post("/data", datos);
    },
    FirmarDocumento(datos){
        return Api().post("/firmar_lote_pdfs", datos);
    }
}