<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo">
            <button v-if="rol=='ADMINISTRADOR'" class="layout-menu-button layout-topbar-button" @click="onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>

            <div class="layout-topbar-logo">
                <img src='/demo/images/login/logo-fhce.png' alt="logo" />
                <span class="layout-topbar-menu">SGDF</span>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <Menu ref="menu" :model="overlayMenuItems" :popup="true" />
            <Button type="button" :label="rol" icon="pi pi-user" @click="toggleMenu" class="layout-topbar-user" />
        </div>
    </div>
</template>

<script setup>
import loginService from './../services/auth.service'
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from "vue-router"
import { ref, computed, onMounted } from 'vue';
import usuarioService from '@/services/usuario.service';

const { onMenuToggle } = useLayout();

const router = useRouter()
const rol = ref()
const usuario = ref()

const menu = ref(null)

onMounted(() => {
    getUsuario()
});

async function salir() {
    try {
        loginService.logout()
        router.push('/')
    } catch (error) {
        alert("Error al Salir")
    }
}

async function getUsuario() {
    const { data } = await usuarioService.listarUsuario()
    rol.value = data.rol
    usuario.value = data.username
}

const overlayMenuItems = ref([
    {
        label: usuario
    },
    {
        label: 'salir',
        icon: 'pi pi-power-off',
        command: salir
    }
]);

const toggleMenu = (event) => {
    menu.value.toggle(event);
};

</script>



<style lang="scss" scoped></style>
