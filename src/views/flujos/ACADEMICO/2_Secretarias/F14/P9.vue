<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'CONVOCATORIA DE AUXILIARES DE DOCENCIA'">
                </AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :mostrarVFirma="true"
                    :nomDivision="'ATENCIÓN AL TRÁMITE'" :tabla="'conv_aux_docencia'" />
                <br><br>

                <h6 style="color: blue;">FIRMAR LA CONVOCATORIA PARA SU PUBLICACIÓN</h6>
                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarVFirma="true" :mostrar-firmar-doc="true" :nomDivision="'DOCUMENTOS'"
                    :tabla="'conv_aux_docencia'" />
                <br><br>

                <div>
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
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import editDocumentService from '@/services/editDocument.service';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';

const router = useRouter()
const store = useStore()
const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const nomArchivos = ref(['1. Convocatoria Auxiliar de Docencia']);
const valueArchivos = ref(["convocatoria"]);

const nomArchivos2 = ref(['1. Certificacion de carga horaria', '2. Nota de atención']);
const valueArchivos2 = ref(["certificacion_carga_horaria", "nota_atencion"]);

onMounted(async () => {
    const dat = { columna: 'convocatoria', observacion: null, nrotramite: datosrecividos.nrotramite, tabla: 'conv_aux_docencia' };
    await documentService.actualizarobservacionDocumentos(dat);
});

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
    const nt = datosrecividos.nrotramite;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const obs = comentario.value;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: ' -  ' + obs };

    loadingModal.value = true;
    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/tramite-pendiente");
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