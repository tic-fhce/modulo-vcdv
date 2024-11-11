<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA DE DOCENTES CONTRATADOS'"></AppDatos>
                
                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'conv_doc_contratados'"
                    :nom-division="'CONVOCATORIA'" :mostrar-observaciones-prop="true" /><br>

                <DocumentTable :documentos="documentos"></DocumentTable>

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
import { ref, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import workflowService from '@/services/workflow.service';
import editDocumentService from '@/services/editDocument.service';
import DocumentTable from './Components/GenerarDocumentos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const obs = ref(null)
const listaArchivosKey = ref(0);

const documentos = ref([
    { nombre: '1. Convocatoria docentes contratados', value: 'convocatoria', url: '', activo: true},
    { nombre: '2. Nota de atención',  value: 'nota_atencion', url: '', activo: false }
]);

const nomArchivos = ref(["1. Convocatoria docentes contratados"]);
const valueArchivos = ref(["convocatoria"]);

async function enviarTramite() {
    confirm.require({
        message: 'Está seguro de enviar estos datos',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            loadingModal.value = true;
            try {
                const a = datosrecividos.nrotramite
                const b = datosrecividos.flujo
                const c = datosrecividos.proceso
                let com = ''
                if (obs) {
                    com = 'corrección de la convocatoria'
                }

                const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': com, 'condicion': '' }
                const response = await workflowService.siguienteproceso(env);
                if (response) {
                    await generarHojaDeRuta();
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo avanzar al siguiente proceso', life: 3000 });
                }
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
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
    let o = ''
    if(obs.value){ o = '  - corrección' }
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: o };

    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Al generar la hoja de ruta', life: 3000 });
        redireccionar("/tramite-pendiente");
    }
}

function redireccionar(url) {
    router.replace(url)
}
</script>