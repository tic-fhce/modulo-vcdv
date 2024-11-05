<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCIÓN DE MATERIAS EXTRA'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'materia_extra'"
                    :nomDivision="'DOCUMENTOS CARGADOS'" /><br><br>

                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'materia_extra'"
                    :nomDivision="'AVAL DE APROBACIÓN'" :mostrar-v-firma="true" />
                <br><br>

                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite()"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
                </div>
            </div>
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'

const router = useRouter()
const store = useStore()

const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const nomArchivos = ref(['1. Nota de solicitud', '2. Respaldo']);
const valueArchivos = ref(["solicitud", "respaldo"]);

const nomArchivos2 = ref(['1. Aval de Aprobacion']);
const valueArchivos2 = ref(["aval"]);

function redireccionar(url) {
    router.replace(url)
}
</script>

<style></style>