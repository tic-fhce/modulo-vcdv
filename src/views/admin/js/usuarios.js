// import .... from "@/services/";

export const Usuarios = {
    async getData() {
        try {
            /*const {data} = await seguimientoService.listarTramite()
            
            const datosFormateados = data.map(l => {
                return {
                    id: l.id,
                    nombres: l.nombre,
                    apellidos: l.apellido,
                    ci: l.ci,
                    cif: l.cif,
                    sexo: l.sexo,
                    celular: l.celular,
                    correo: l.correo,
                    rol: l.rol
                };
            });

            console.log(datosFormateados);
            return datosFormateados;*/
            return null;
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            return [];
        }
    }
};

