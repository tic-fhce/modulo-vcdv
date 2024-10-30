import designacionTribunalService from "@/services/designacionTribunal.service";

export const designacionTribunals = {
    async getData(carrera, year) {
        try {
            const {data} = await designacionTribunalService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

