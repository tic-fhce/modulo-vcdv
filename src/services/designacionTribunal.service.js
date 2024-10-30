import { Api } from "./api.service"

export default {
    actulizarColumna(datos){
        return Api().patch("/designacionTribunal/actualizar", datos)
    },
    obtenerColumna(datos){
        return Api().post("/designacionTribunal/obtener", datos)
    },
    obtenerPerfilGrado(){
        return Api().post("/designacionTribunal/aprobacionPerfil")
    },
    obtenerPerfilGradoId(dato){
        return Api().post("/designacionTribunal/aprobacionPerfil", dato)
    },
    listarCarreraYear(datos){
        return Api().post("/designacionTribunal/listar-carrera-year", datos)
    }
}