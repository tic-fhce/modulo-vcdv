import tramitePendienteService from '../../services/seguimiento.service'
import { intervalToDuration, format } from 'date-fns';

export const TramitePendienteService = {
    async getData() {
        try {
            const { data } = await tramitePendienteService.listTramitePendiente();
            const datosFormateados = data.map(tramite => {
                // Suponemos que fecha_inicio y tiempo son fechas validas
                const fechaInicio = new Date(tramite.fecha_inicio[0], tramite.fecha_inicio[1] - 1, tramite.fecha_inicio[2], tramite.fecha_inicio[3], tramite.fecha_inicio[4]);
                const fechaTiempo = new Date(tramite.tiempo[0], tramite.tiempo[1] - 1, tramite.tiempo[2], tramite.tiempo[3], tramite.tiempo[4]);

                // Calcula la duración entre las fechas
                const duration = intervalToDuration({ start: fechaInicio, end: fechaTiempo });
                
                // Formatea la duración en días, horas y minutos
                let duracionFormateada = '';
                if (duration.days) duracionFormateada += `${duration.days} días `;
                if (duration.hours) duracionFormateada += `${duration.hours} horas `;
                if (duration.minutes) duracionFormateada += `${duration.minutes} minutos`;
                return {
                    id: tramite.seg_id,
                    nrotramite: tramite.tram_id,
                    flujo: tramite.flujo,
                    proceso: tramite.proceso,
                    formulario: tramite.formulario,
                    observaciones: tramite.comentario,
                    fechainicio: format(fechaInicio, 'dd/MM/yyyy HH:mm'),
                    tiempo: duracionFormateada.trim(),
                    estado: tramite.estado,
                    rol: tramite.role_name
                };
            });
            return datosFormateados;
        } catch (error) {
            console.error('Error al obtener datos', error);
            return [];
        }
    }
};
