import tramiteService from '@/services/seguimiento.service'
export const TramiteConcluidoService = {
    async getData() {
        try {
            const {data} = await tramiteService.listTramiteConcluido();
            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(tramite => {
                const x = tramite.fecha_inicio
                const fechaInicio = (x[2])+"/"+(x[1])+"/"+(x[0])+"  "+(x[3])+":"+(x[4])

                const y = tramite.fecha_fin
                const fechaFin = (y[2])+"/"+(y[1])+"/"+(y[0])+"  "+(y[3])+":"+(y[4])
                return {
                    id: tramite.seg_id,
                    nrotramite: tramite.tram_id,
                    flujo: tramite.flujo,
                    proceso: tramite.proceso,
                    formulario: tramite.formulario,
                    observaciones: tramite.comentario,
                    fechafin: fechaFin,
                    estado: tramite.estado
                };
            });

            //console.log(datosFormateados);
            return datosFormateados;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }

    // getTramitePendienteSmall() {
    //     return Promise.resolve(this.getData().slice(0, 10));
    // },

    // getTramitePendienteMedium() {
    //     return Promise.resolve(this.getData().slice(0, 50));
    // },

    // getTramitePendienteLarge() {
    //     return Promise.resolve(this.getData().slice(0, 200));
    // },

    // getTramitePendienteXLarge() {
    //     return Promise.resolve(this.getData());
    // }
};

