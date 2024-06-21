import seguimientoService from "@/services/seguimiento.service";

export const Listar = {
    async getData() {
        try {
            const {data} = await seguimientoService.listarTramite()
            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(l => {
                return {
                    nrotramite: l.id,
                    carrera: l.carrera,
                    tipo: l.tipo,
                    formulario: l.formulario,
                    username: l.username,
                    estado: l.estado,
                    unidad: l.unidad
                };
            });

            //console.log(datosFormateados);
            return datosFormateados;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

