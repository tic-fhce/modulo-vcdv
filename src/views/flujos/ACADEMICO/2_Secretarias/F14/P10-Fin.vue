<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA DE AUXILIARES DE DOCENCIA'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :mostrar-v-firma="true"
                    :nomDivision="'DOCUMENTOS'" :tabla="'conv_aux_docencia'" />
                <br><br>

                <h6 style="color: blue;">DESCARGAR Y PUBLICAR LA CONVOCATORIA</h6>
                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :mostrarVFirma="true"
                    :nomDivision="'CONVOCATORIA'" :tabla="'conv_aux_docencia'" />
                <br><br>

                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Carga -->
    <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false"
        header="Cargando datos">
        <div class="flex align-items-center justify-content-center">
            <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                animationDuration=".5s" />
            <span class="ml-3">Enviando, espere por favor...</span>
        </div>
    </Dialog>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;

const nomArchivos = ref(['1. Certificacion de carga horaria', '2. Nota de atención']);
const valueArchivos = ref(["certificacion_carga_horaria", "nota_atencion"]);

const nomArchivos2 = ref(['1. Convocatoria Auxiliar de Docencia']);
const valueArchivos2 = ref(["convocatoria"]);

function redireccionar(url) {
    router.replace(url);
}
</script>
