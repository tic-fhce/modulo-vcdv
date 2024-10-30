import alumnoLibreService from "@/services/alumnoLibre.service";

export const alumnosLibre = {
    async getData(carrera, year) {
        try {
            const {data} = await alumnoLibreService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

