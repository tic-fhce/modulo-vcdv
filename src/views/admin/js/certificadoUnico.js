import certificadoUnicoService from "@/services/certificadoUnico.service";

export const certificadosU = {
    async getData(carrera, year) {
        try {
            const {data} = await certificadoUnicoService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

