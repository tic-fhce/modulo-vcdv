<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/demo/images/login/logo-fhce.png" alt="FHCE logo" class="mb-5 w-14rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Sistema de Gestión Documental</div>
                        <span class="text-600 font-medium">Ingrese sus Credenciales</span>
                    </div>
                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Usuario</label>
                        <InputText id="username" type="text" placeholder="Usuario" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="credenciales.username" @keyup.enter="funIngresar" />
                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="credenciales.password" placeholder="Contraseña" toggleMask class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" @keyup.enter="funIngresar"></Password>
                        <br><br>
                        <Button @click="funIngresar" label="Iniciar Sesión" class="w-full p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import loginService from "./../../services/auth.service"
import { useRouter } from "vue-router"
import usuarioService from "@/services/usuario.service"

const router = useRouter()
const rol = ref(null)
const usuario = ref(null)

const credenciales = ref({ username: "", password: "" })
const errors = ref({})

async function funIngresar() {
    try {
        const response = await loginService.login(credenciales.value)
        localStorage.setItem("access_token", response.data.token)
        await getUsuario()
        if (rol.value === 'ADMINISTRADOR') {
            router.push("/adm/panel");
        } else {
            router.push("/inicio");
        }
    } catch (error) {
        errors.value = error.response.data.errors
        alert("Error al Autenticar")
    }
}

async function getUsuario() {
    try {
        const { data } = await usuarioService.listarUsuario()
        rol.value = data.rol
        usuario.value = data.username
    } catch (error) {
        console.error("Error obteniendo el usuario:", error)
        alert("Error obteniendo el usuario")
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
</style>
