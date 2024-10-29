import { Api } from "./api.service"

export default {
    ListarInicioFlujo(){
        return Api().get("/flujo/listP1");
    },
    ListarFlujos(){
        return Api().get("/flujo/list")
    },
    ActualizarHabilitado(datos){
        return Api().put("/flujo/actualizar-habilitado", datos)
    },
    ActualizarProcedimiento(datos){
        return Api().put("/flujo/actualizar-procedimiento", datos)
    }
}