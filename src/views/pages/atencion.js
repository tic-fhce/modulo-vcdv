import seguimientoService from "@/services/seguimiento.service";

export const Listar = {
    async getData() {
        try {
            const { data } = await seguimientoService.listHojaRutaAtendidas();

            // Procesar los datos recibidos y transformarlos al formato deseado
            const datosFormateados = data.map(l => {
                const fechasFinalizacion = l.fechas_finalizacion.split(',');
                const formularios = l.formularios.split(',');
                const estados = l.estados.split(',');

                // Función para formatear la fecha
                const formatearFecha = (fecha) => {
                    const dateObj = new Date(fecha.trim());
                    const dia = String(dateObj.getDate()).padStart(2, '0');
                    const mes = String(dateObj.getMonth() + 1).padStart(2, '0'); // Los meses son 0-based
                    const año = dateObj.getFullYear();
                    const horas = String(dateObj.getHours()).padStart(2, '0');
                    const minutos = String(dateObj.getMinutes()).padStart(2, '0');
                    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
                };

                // Construir el arreglo de registros para la expansión
                const detalles = fechasFinalizacion.map((fecha, index) => ({
                    fecha_finalizacion: formatearFecha(fecha),
                    formulario: formularios[index].trim(),
                    estado: estados[index].trim()
                }));

                return {
                    nrotramite: l.tram_id,
                    f_atencion: formatearFecha(fechasFinalizacion[fechasFinalizacion.length - 1]), // Mostrar la última fecha de atención
                    solicitud: l.tipo,
                    detalles // Este es el array que se usará en la expansión
                };
            });

            return datosFormateados;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};