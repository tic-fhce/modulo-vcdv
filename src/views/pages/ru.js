import seguimientoService from "@/services/seguimiento.service";

export const Listar = {
    async getData() {
        try {
            const {data} = await seguimientoService.listarSeguimientoTramite()
            console.log(data)
            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(l => {
                const x = l.creacion
                const fechaInicio = x.split(" ")
                return {
                    nrotramite: l.id,
                    fecha_inicio: l.creacion,
                    solicitud: l.tipo,
                    ub_tramite: l.unidad,
                    estado: l.estado,
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

