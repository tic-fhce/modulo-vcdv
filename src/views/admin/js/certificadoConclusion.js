import certificadoConclusionService from "@/services/certificadoConclusion.service";

export const certificadosC = {
    async getData(carrera, year) {
        try {
            const {data} = await certificadoConclusionService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

