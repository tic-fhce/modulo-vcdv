import convalidacion01Service from "@/services/convalidacion01.service";

export const convalidacion01 = {
    async getData(carrera, year) {
        try {
            const {data} = await convalidacion01Service.listarCarreraYear({'carrera': carrera, 'year': year})
            console.log(data)
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

