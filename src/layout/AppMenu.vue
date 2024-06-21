<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Inicio',
        items: [{ label: 'Panel', icon: 'pi pi-fw pi-home', to: '/panel' }]
    },
    {
        label: 'Seguimiento',
        items: [
            { label: 'Tramites', icon: 'pi pi-list', to: '/tramite' },
            { label: 'Seguimiento', icon: 'pi pi-list', to: '/seguimiento' },
        ]
    },
    {
        label: 'Flujos',
        items: [
            { label: 'Perfil de Grado', icon: 'pi pi-folder-open', to: '/perfilGrado' },
            { label: 'Designacion de Tribunal', icon: 'pi pi-folder-open', to: '/designacionTribunal' },
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
