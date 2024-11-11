<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'CONVOCATORIA DE DOCENTES CONTRATADOS'"></AppDatos>
               
                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarObservacionesProp="true" :mostrarRevision="true" :mostrarVFirma="true" :nomDivision="'DOCUMENTOS'"
                    :tabla="'conv_doc_contratados'" />
                <br><br>

                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2"
                    :mostrarVFirma="true" :nomDivision="'ATENCIÓN AL TRÁMITE'" :tabla="'conv_doc_contratados'" />
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

const nomArchivos = ref(['1. Convocatoria concurso de meritos', ]);
const valueArchivos = ref(["convocatoria"]);

const nomArchivos2 = ref(['1. Certificacion de carga horaria', '2. Nota de atención']);
const valueArchivos2 = ref(["certificacion_carga_horaria", "nota_atencion"]);

onMounted(async () => {
    const dat = { columna: 'convocatoria', observacion: null, nrotramite: datosrecividos.nrotramite, tabla: 'conv_doc_contratados' };
    await documentService.actualizarobservacionDocumentos(dat);
});

async function enviarTramite() {
    if (valRef.value.validarRadioButtons()) {
        confirm.require({
            message: 'Está seguro de enviar estos datos',
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            accept: async () => {
                try {
                    const result = await valRef.value.todosDocumentosCorrectos();
                    if (!result) {
                        cond.value = 'no'
                        comentario.value = 'observado'
                    }
                    const tb = valRef.value.tabla;
                    const nt = datosrecividos.nrotramite;
                    const enviarSolicitud = async (index) => {
                        if (index < tb.length) {
                            const e = tb[index];
                            const corr = e.correcto.value;
                            const err = e.errores.value;
                            let obs;

                            if (corr === 'correcto') {
                                obs = corr;
                            } else {
                                obs = err;
                            }
                            const dat = { columna: valueArchivos.value[index], observacion: obs, nrotramite: nt, tabla: 'conv_doc_contratados' };
                            await documentService.actualizarobservacionDocumentos(dat);

                            await enviarSolicitud(index + 1);
                        } else {
                            const b = datosrecividos.flujo
                            const c = datosrecividos.proceso
                            try {
                                const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': comentario.value, 'condicion': cond.value }
                                const response = await workflowService.siguienteproceso(env);
                                if (response) {
                                    await generarHojaDeRuta();
                                }
                            } catch (error) {
                                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                            }
                        }
                    };
                    await enviarSolicitud(0);
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                }
            }
        });
    }
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