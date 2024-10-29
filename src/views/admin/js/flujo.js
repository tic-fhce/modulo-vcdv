import flujoService from '@/services/flujo.service'

export const Flujos = {
    async getData() {
        try {
            const { data } = await flujoService.ListarFlujos();

            const datosFormateados = data.map(l => {
                let cond = null;
                if (l.procesoCondicion != null) {
                    cond = { 'si': l.procesoCondicion.si, 'no': l.procesoCondicion.no };
                }

                let rol = null;
                if (l.role && l.role.name) {
                    rol = l.role.id;
                }

                return {
                    id: l.id,
                    flujo: l.flujo,
                    proceso: l.proceso,
                    proceso_sig: l.proceso_sig,
                    tiempo: l.tiempo,
                    formulario: l.formulario,
                    habilitado: l.habilitado,
                    role: rol,
                    condiciones: cond,
                };
            });

            return datosFormateados;
        } catch (error) {
            console.error('Error al obtener los flujos:', error);
            return [];
        }
    }
};

