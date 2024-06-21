import { Api } from "./api.service"

export default {
    inicioFlujo(datos){
        return Api().post("/api/workflow/inicioFlujo", datos);
    },

    siguienteproceso(datos){
        return Api().post("/api/workflow/siguienteFormulario", datos)
    }
}