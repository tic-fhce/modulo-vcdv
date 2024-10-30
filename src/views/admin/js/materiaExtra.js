import materiaExtraService from "@/services/materiaExtra.service";

export const materiasExtra = {
    async getData(carrera, year) {
        try {
            const {data} = await materiaExtraService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

