<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA DE AUXILIARES DE DOCENCIA'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarVFirma="true" :nomDivision="'DOCUMENTOS'" :tabla="'conv_aux_docencia'" />
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
import workflowService from '@/services/workflow.service';
import editDocumentService from '@/services/editDocument.service';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;

const nomArchivos = ref(['1. Convocatoria Auxiliar de Docencia', '2. Certificacion de carga horaria', '3. Nota de atención']);
const valueArchivos = ref(["convocatoria", "certificacion_carga_horaria", "nota_atencion"]);

async function enviarTramite() {
    confirm.require({
        message: '¿Está seguro de enviar estos datos?',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            loadingModal.value = true;
            try {
                const a = datosrecividos.nrotramite;
                const b = datosrecividos.flujo;
                const c = datosrecividos.proceso;

                const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': '', 'condicion': '' };
                const response = await workflowService.siguienteproceso(env);

                if (response) {
                    await generarHojaDeRuta();
                    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Trámite enviado y hoja de ruta generada.', life: 3000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo avanzar al siguiente proceso.', life: 3000 });
                }
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos.', life: 3000 });
            } finally {
                loadingModal.value = false;
            }
        }
    });
}

async function generarHojaDeRuta() {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const nt = datosrecividos.nrotramite;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: '' };

    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al generar la hoja de ruta.', life: 3000 });
        redireccionar("/tramite-pendiente");
    }
}

function redireccionar(url) {
    router.replace(url);
}
</script>
