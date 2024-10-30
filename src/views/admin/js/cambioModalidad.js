import cambioModalidadService from "@/services/cambioModalidad.service";

export const cambioModalidades = {
    async getData(carrera, year) {
        try {
            const {data} = await cambioModalidadService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

