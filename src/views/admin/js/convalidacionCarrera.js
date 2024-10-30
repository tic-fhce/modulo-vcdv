import convalidacion02Service from "@/services/convalidacion02.service";

export const convalidacion02 = {
    async getData(carrera, year) {
        try {
            const {data} = await convalidacion02Service.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

