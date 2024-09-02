import seguimientoService from "@/services/seguimiento.service";
import { intervalToDuration, format } from 'date-fns';

export const Listar = {
    async getData() {
        try {
            const {data} = await seguimientoService.listar();
            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(l => {
                const x = l.fecha_inicio
                const y = l.fecha_fin
                const z = l.tiempo

                let fechaFinFormateada = 'No terminado ...';
                if (y) {
                    const fechaFin = new Date(y[0], y[1] - 1, y[2], y[3], y[4]);
                    fechaFinFormateada = format(fechaFin, 'dd/MM/yyyy HH:mm');
                }

                // Suponemos que fecha_inicio y tiempo son fechas validas
                const fechaInicio = new Date(x[0], x[1] - 1, x[2], x[3], x[4]);
                const fechaTiempo = new Date(z[0], z[1] - 1, z[2], z[3], z[4]);

                // Calcula la duración entre las fechas
                const duration = intervalToDuration({ start: fechaInicio, end: fechaTiempo });
                
                // Formatea la duración en días, horas y minutos
                let duracionFormateada = '';
                if (duration.days) duracionFormateada += `${duration.days} días `;
                if (duration.hours) duracionFormateada += `${duration.hours} horas `;
                if (duration.minutes) duracionFormateada += `${duration.minutes} minutos`;

                return {
                    id: l.id,
                    nrotramite: l.tramite_id,
                    usuario: l.usuario,
                    rol: l.rol,
                    fechaini: format(fechaInicio, 'dd/MM/yyyy HH:mm'),
                    fechafin: fechaFinFormateada,
                    carrera: l.carrera,
                    activo: l.activo,
                    estado: l.estado,
                    observacion: l.observacion,
                    formulario: l.formulario,
                    tiempo: duracionFormateada.trim()
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

