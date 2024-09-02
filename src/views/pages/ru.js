import seguimientoService from "@/services/seguimiento.service";

export const Listar = {
    async getData() {
        try {
            const {data} = await seguimientoService.listarSeguimientoTramite()
            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(l => {
                const x = l.creacion
                const fechaInicio = (x[2])+"/"+(x[1])+"/"+(x[0])+"  "+(x[3])+":"+(x[4])
                return {
                    nrotramite: l.id,
                    fecha_inicio: fechaInicio,
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

