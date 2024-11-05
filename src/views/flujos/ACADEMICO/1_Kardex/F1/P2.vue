<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCIÓN DE ASIGNATURAS DE ALUMNOS LIBRES'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'alumno_libre'" />
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
import { createApp, ref, computed, onMounted } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()
const store = useStore()
const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const nomArchivos = ref(['1. Nota de solicitud', '2. Respaldo']);
const valueArchivos = ref(["solicitud", "respaldo"]);

async function enviarTramite() {
    confirm.require({
        message: 'Está seguro de enviar estos datos',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                try {
                    const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': datosrecividos.nrotramite, 'comentario': '', 'condicion': '' }
                    const response = await workflowService.siguienteproceso(env);
                    if (response) {
                        await generarHojaDeRuta();
                    }
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                }
                redireccionar("/tramite-pendiente")
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
            }
        }
    });
}

async function generarHojaDeRuta() {
    const nt = datosrecividos.nrotramite;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: '' };

    loadingModal.value = true;
    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        alert('Error al generar la hoja de ruta', error);
        redireccionar("/tramite-pendiente");
    } finally {
        loadingModal.value = false;
    }
}

function redireccionar(url) {
    router.replace(url)
}
</script>