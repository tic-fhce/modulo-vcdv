import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().post("/api/designacionTribunal/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/api/designacionTribunal/obtener", datos)
    },
    obtenerPerfilGrado(){
        return Api().post("/api/designacionTribunal/aprobacionPerfil")
    },
    obtenerPerfilGradoId(dato){
        return Api().post("/api/designacionTribunal/aprobacionPerfil", dato)
    }
}