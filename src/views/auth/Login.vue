<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen overflow-hidden">
        <!-- Agrega el componente Toast aquí -->
        <Toast />
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/demo/images/login/logo-fhce.png" alt="FHCE logo" class="mb-5 w-14rem flex-shrink-0" />
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"
            >
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Sistema de Gestión Documental</div>
                        <span class="text-600 font-medium">Ingrese sus Credenciales</span>
                    </div>
                    <div>
                        <!-- Mensajes de error debajo de cada campo -->
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Usuario</label>
                        <InputText
                            id="username"
                            type="text"
                            placeholder="Usuario"
                            class="w-full md:w-30rem mb-2"
                            style="padding: 1rem"
                            v-model="credenciales.username"
                            @keyup.enter="funIngresar"
                        /><br>
                        <span v-if="errors.username" class="text-red-500 mb-2">{{ errors.username }}</span>

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password
                            id="password1"
                            v-model="credenciales.password"
                            placeholder="Contraseña"
                            toggleMask
                            class="w-full mb-2"
                            inputClass="w-full"
                            :inputStyle="{ padding: '1rem' }"
                            @keyup.enter="funIngresar"
                        ></Password>
                        <span v-if="errors.password" class="text-red-500 mb-2">{{ errors.password }}</span>

                        <br /><br />
                        <Button @click="funIngresar" label="Iniciar Sesión" class="w-full p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import loginService from './../../services/auth.service';
import { useRouter } from 'vue-router';
import usuarioService from '@/services/usuario.service';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const rol = ref(null);
const usuario = ref(null);

const credenciales = ref({ username: '', password: '' });
const errors = ref({});
const toast = useToast();

async function funIngresar() {
    // Reiniciar errores
    errors.value = {};

    // Validación de campos vacíos
    if (!credenciales.value.username) {
        errors.value.username = 'El nombre de usuario es requerido';
    }

    if (!credenciales.value.password) {
        errors.value.password = 'La contraseña es requerida';
    }

    // Si hay errores, mostrar toast y detener la ejecución
    if (Object.keys(errors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Campos incompletos',
            detail: 'Por favor complete todos los campos requeridos.',
            life: 3000,
        });
        return;
    }

    try {
        const response = await loginService.login(credenciales.value);
        localStorage.setItem('access_token', response.data.token);
        await getUsuario();
        if (rol.value === 'ADMINISTRADOR') {
            router.push('/adm/panel');
        } else {
            router.push('/inicio');
        }
    } catch (error) {
        // Manejo de errores de autenticación
        if (error.response && error.response.status === 401) {
            errors.value.general = 'Usuario o contraseña incorrectos';
        } else {
            errors.value.general = 'Error al autenticar';
        }
        // Mostrar toast de error
        toast.add({
            severity: 'error',
            summary: 'Error de autenticación',
            detail: errors.value.general,
            life: 5000,
        });
    }
}

async function getUsuario() {
    try {
        const { data } = await usuarioService.listarUsuario();
        rol.value = data.rol;
        usuario.value = data.username;
    } catch (error) {
        console.error('Error obteniendo el usuario:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error obteniendo el usuario',
            life: 3000,
        });
    }
}
</script>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.text-red-500 {
    color: #f56565;
}
</style>
