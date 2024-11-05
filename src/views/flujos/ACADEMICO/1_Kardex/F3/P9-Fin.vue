<template>
    <AppTopbar></AppTopbar>
    <Toast />
    <ConfirmDialog />
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CONVALIDACION DE MATERIAS DE PLAN A PLAN'"></AppDatos>
                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'convalidacion_01'"
                    :nom-division="'DOCUMENTOS CARGADOS'" />
                <br><br>
                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :tabla="'convalidacion_01'" :mostrarVFirma="true" :nom-division="'INFORME DE CONVALIDACIÓN'" />
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
            <!-- {{ datosrecividos }} -->
        </div>
    </div>
    <!-- Modal de Carga -->
    <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false"
        header="Cargando datos">
        <div class="flex align-items-center justify-content-center">
            <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                animationDuration=".5s" />
            <span class="ml-3">Enviando, espere porfavor...</span>
        </div>
    </Dialog>
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
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const valueArchivos = ["informe_convalidacion"];
const nomArchivos = ["1. Informe de Convalidacion"];

const valueArchivos2 = ["nota_director", "cedula_identidad", "record_academico"];
const nomArchivos2 = ["1. Nota dirigida al Director", "2. Cedula de Identidad", "3. Record Academico"];

function redireccionar(url) {
    router.replace(url)
}

</script>

<style></style>