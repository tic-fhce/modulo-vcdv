<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Inicio',
        items: [{ label: 'Panel Principal', icon: 'pi pi-home', to: '/adm/panel' }]
    },
    {
        label: 'Seguimiento',
        items: [
            { label: 'Trámites', icon: 'pi pi-briefcase', to: '/adm/tramite' }
        ]
    },
    {
        label: 'Administración',
        items: [
            { label: 'Usuarios', icon: 'pi pi-users', to: '/adm/usuario' },
            { label: 'Flujo de Procesos', icon: 'pi pi-sitemap', to: '/adm/flujo' }
        ]
    },
    {
        label: 'Documentos',
        items: [
            {
                label: 'Modalidades Graduación',
                icon: 'pi pi-graduation-cap',
                items: [
                    { label: 'Aprobación Perfil Grado', icon: 'pi pi-file', to: '/adm/graduacion/aprobacionPerfil' },
                    { label: 'Designación Tribunal Grado', icon: 'pi pi-file', to: '/adm/graduacion/designacionTribunal'},
                    { label: 'Cambio Modalidad Graduación', icon: 'pi pi-file', to: '/adm/graduacion/cambioModalidad'},
                ]
            },
            {
                label: 'Convalidación Materias',
                icon: 'pi pi-share-alt',
                items: [
                    { label: 'Carreras', icon: 'pi pi-file', to: '/adm/convalidacion/carrera'},
                    { label: 'Plan a Plan', icon: 'pi pi-file', to: '/adm/convalidacion/planPlan' },
                ]
            },
            {
                label: 'Inscripciones',
                icon: 'pi pi-user-plus',
                items: [
                    { label: 'Alumno Libre', icon: 'pi pi-file', to: '/adm/inscripcion/alumnoLibre' },
                    { label: 'Materias Extra', icon: 'pi pi-file', to: '/adm/inscripcion/materiaExtra'},
                ]
            },
            {
                label: 'Certificados',
                icon: 'pi pi-file',
                items: [
                    { label: 'Conclusión Estudios', icon: 'pi pi-file', to: '/adm/certificado/conclusionEstudios' },
                    { label: 'Único de Calificaciones', icon: 'pi pi-file', to: '/adm/certificado/unicoCalificacion'},
                ]
            },
        ]
    },
]);
</script>


<style lang="scss" scoped></style>