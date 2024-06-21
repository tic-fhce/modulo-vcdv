import { Api } from "./api.service"

export default {
    listarUsuario(){
        return Api().get("/api/user");
    }
}