import aprobacionPerfilService from '@/services/aprobacionPerfil.service';

export const aprobacionPerfiles = {
    async getData() {
        try {
            const Lista = [
                {
                    id: 1,
                    tramite: {
                        id: 'FHCE-PSI-44',
                        flujo: 'c4', // Representa la carrera de Psicología
                        proceso: 'P2',
                        tipo: 'APROBACIÓN DE PERFIL DE GRADO'
                    },
                    nombres: 'Juan',
                    apellidos: 'Pérez',
                    ci: '12345678',
                    estado: 'En revisión',
                    fecha: '2023-03-15',
                    d_carta_institucion: 'carta_institucion.pdf',
                    d_conclusion_estudios: 'conclusion_estudios.pdf',
                    d_nota_director: 'nota_director.pdf',
                    d_nota_tutor: 'nota_tutor.pdf',
                    d_perfil_grado: 'perfil_grado.pdf',
                    d_record_academico: 'record_academico.pdf'
                },
                {
                    id: 2,
                    tramite: {
                        id: 'FHCE-SIST-12',
                        flujo: 'c1', // Representa la carrera de Ingeniería de Sistemas
                        proceso: 'P2',
                        tipo: 'APROBACIÓN DE PERFIL DE GRADO'
                    },
                    nombres: 'María',
                    apellidos: 'Gómez',
                    ci: '23456789',
                    estado: 'Aprobado',
                    fecha: '2022-07-10',
                    d_carta_institucion: 'carta_institucion.pdf',
                    d_conclusion_estudios: 'conclusion_estudios.pdf',
                    d_nota_director: null,
                    d_nota_tutor: 'nota_tutor.pdf',
                    d_perfil_grado: 'perfil_grado.pdf',
                    d_record_academico: 'record_academico.pdf'
                },
                {
                    id: 3,
                    tramite: {
                        id: 'FHCE-ECON-05',
                        flujo: 'c8', // Representa la carrera de Economía
                        proceso: 'P3',
                        tipo: 'APROBACIÓN DE PERFIL DE GRADO'
                    },
                    nombres: 'Carlos',
                    apellidos: 'Rodríguez',
                    ci: '34567890',
                    estado: 'En espera',
                    fecha: '2023-01-25',
                    d_carta_institucion: null,
                    d_conclusion_estudios: 'conclusion_estudios.pdf',
                    d_nota_director: 'nota_director.pdf',
                    d_nota_tutor: 'nota_tutor.pdf',
                    d_perfil_grado: 'perfil_grado.pdf',
                    d_record_academico: null
                }
            ];
            return Lista;
            /*const {data} = await aprobacionPerfilService.listar()
            console.log(data)
            const datosFormateados = data.map(l => {
                return {
                    id: l.id,
                    nombres: l.nombre,
                    apellidos: l.apellido,
                    ci: l.ci,
                    cif: l.cif,
                    sexo: l.sexo,
                    celular: l.celular,
                    correo: l.correo,
                    rol: l.rol
                };
            });

            console.log(datosFormateados);
            return datosFormateados;*/
            return null
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            return [];
        }
    }
};

