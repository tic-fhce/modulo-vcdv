<template>
    <AppTopbar></AppTopbar>
    <Toast />
    <ConfirmDialog />
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CERTIFICADO ÚNICO DE CALIFICACIONES'">
                </AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :tabla="'certificado_conclusion'" :nom-division="'DOCUMENTO'" :mostrarVFirma="true" />
                <br><br>
                <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                        class="pi pi-arrow-left">&nbsp;Regresar</i></Button>

            </div>
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
const urlDoc = ref()

const valueArchivos = ['certificado_conclusion']
const nomArchivos = ['1. Certificado de Conclusión de Estudios'];

function redireccionar(url) {
    router.replace(url)
}
</script>