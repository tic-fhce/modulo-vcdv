<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA PARA DOCENTES INTERINOS'"></AppDatos>

                <div v-if="obs" class="card" style="background-color: rgb(246, 246, 246);">
                    <h5>
                        <span style="color: red;">OBSERVACION: </span>
                        <span :style="{ color: 'blue', textTransform: 'uppercase' }">fdas{{ observacion
                            }}</span>
                    </h5>
                    <h6 :style="{ color: 'red', textTransform: 'uppercase' }">corrija el documento segun las
                        obsrvaciones y vuelva a enviar</h6>
                </div><br>

                <div class="card">
                    <h5 style="text-decoration: underline;">CONVOCATORIA</h5>
                    <div class="field grid" v-if="!cConvocatoria">
                        <label for="convocatoria" class="col-12 mb-2 lg:col-3 lg:mb-0">
                            SELECCIONE UNA OPCIÓN:
                        </label>
                        <div class="col-12 mb-2 lg:col-3 lg:mb-9">
                            <Dropdown v-model="docDrive" :options="documentosDisponibles" optionLabel="name"
                                placeholder="Seleccione un documento" />
                        </div>
                    </div>
                    <div class="field grid" v-else>
                        <div class="col-12 mb-2 lg:col-12 lg:mb-0">
                            <h5 style="color: blue;">{{ tipo }}</h5>
                        </div>
                    </div>
                </div>

                <DocumentTable :documentos="documentos" :swCrearConv="true"
                    @documents-uploaded="verDatosConvocatoria()"></DocumentTable>


                <br><br>
                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    solicitar la certificacion de carga horaria a personal docente
                </h6>
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
import { ref, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import workflowService from '@/services/workflow.service';
import convocatoriaService from '@/services/convDocInterinos.service'
import editDocumentService from '@/services/editDocument.service';
import DocumentTable from './Components/GenerarDocumentos.vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const cConvocatoria = ref()
const tipo = ref()

const obs = datosrecividos.observaciones
const observacion = ref()

const documentosDisponibles = [
    { name: 'DOCENTE(S) INVESTIGADOR(ES) INTERINO(S)', code: 'F7 DOCENTE(S) INVESTIGADOR(ES) INTERINO(S).docx' },
    { name: 'DOCENTE(S) INVESTIGADOR(ES) CONTRATADO(S)', code: 'F7 DOCENTE(S) INVESTIGADOR(ES) CONTRATADO(S).docx' },
    { name: 'DIRECTOR DEL CURSO PREFACULTATIVO DE LA FACULTAD', code: 'F7 DIRECTOR DEL CURSO PREFACULTATIVO DE LA FACULTAD.docx' },
    { name: 'COORDINADOR DEL PROGRAMA DE POSTGRADO', code: 'F7 COORDINADOR DEL PROGRAMA DE POSTGRADO.docx' },
    { name: 'P.E.T.A.E.N.G', code: 'F7 P.E.T.A.E.N.G.docx' }
];
const docDrive = ref(documentosDisponibles[0]);

const documentos = ref([
    { nombre: '1. Convocatoria concurso de meritos', archivo: docDrive.value.code, value: 'convocatoria', url: '', activo: true, tipo: docDrive.value.name },
    { nombre: '2. Nota de atención', archivo: 'F7 D1 NOTA ATENCION.docx', value: 'nota_atencion', url: '', activo: false }
]);

watch(docDrive, (newSelection) => {
    const documento = documentos.value.find(doc => doc.value === 'convocatoria');
    if (documento) {
        documento.archivo = newSelection.code;
    }
});

onMounted(async () => {
    verDatosConvocatoria();
});

async function verDatosConvocatoria() {
    const { data } = await convocatoriaService.obtenerConvocatoria({ 'nrotramite': datosrecividos.nrotramite })
    if (data) {
        cConvocatoria.value = data.c_convocatoria;
        tipo.value = data.tipo;
    }
}

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
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: '' };

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