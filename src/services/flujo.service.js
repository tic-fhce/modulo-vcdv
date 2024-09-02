import { Api } from "./api.service"

export default {
    ListarInicioFlujo(){
        return Api().get("/api/flujo");
    },
    CrearCursoPreuniversitario(formData){
        return Api().post("/api/flujo/upload", formData)
    }
}