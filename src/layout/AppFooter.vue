<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';

const { layoutConfig } = useLayout();

</script>

<template>
    <div class="layout-footer">
        <img src='/demo/images/login/logo-fhce.png' alt="Logo" height="20" class="mr-2" />
        © 2024 Facultad de Humanidades y Ciencias de la Educación.
        <span class="font-medium ml-5"></span>
    </div>
</template>
<style lang="scss" scoped></style>
