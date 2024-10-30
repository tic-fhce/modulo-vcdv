import aprobacionPerfilService from '@/services/aprobacionPerfil.service';

export const aprobacionPerfiles = {
    async getData(carrera, year) {
        try {
            const {data} = await aprobacionPerfilService.listarCarreraYear({'carrera': carrera, 'year': year})
            return data;
        } catch (error) {
            console.error('Error al obtener los tramites:', error);
            return [];
        }
    }
};

