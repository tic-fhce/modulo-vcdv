<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <div v-if="obs">
                    <h5>
                        <span style="color: blue;">OBSERVACION: </span>
                        <span :style="{ color: 'red', textTransform: 'uppercase' }">{{ observacion
                            }}</span>
                    </h5>
                    <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">corrija el documento segun las
                        obsrvaciones y vuelva a enviar</h6>
                </div>

                <AppDatos :titulo="'CONVOCATORIA DE CONCURSO DE MERITOS PARA DOCENTES'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :tabla="'convocatoria'" />
                <br><br>

                <div>
                    <div v-if="seleccion">
                        <h5>SELECCIONE UNA OPCION </h5>
                        <Dropdown v-model="docDrive" :options="documentosDisponibles" optionLabel="name"
                            placeholder="Seleccione un documento" />
                    </div>
                    <div v-else>
                        <span style="color: red;">CONVOCATORIA: </span>
                        <h5 style="color: blue;">{{ tipo }}</h5>
                    </div>
                </div>

                <h5>GENERAR LA CONVOCATORIA</h5>
                <div v-if="loading" class="loading-icon">
                    <i class="pi pi-spin pi-spinner"></i> Cargando...
                </div> <br>
                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="uploadDocument" :disabled="uploadDone" severity="success">
                        <i class="pi pi-book"> Crear Documento</i>
                    </Button>
                    <Button v-if="uploadDone" :disabled="!swdoc" @click="redirectDocument" severity="info">
                        <i class="pi pi-link"> Editar Documento</i>
                    </Button>
                    <Button v-if="uploadDone" :disabled="!swdoc" @click="downloadDocument" severity="info">
                        <i class="pi pi-download"> Descargar Documento</i>
                    </Button>
                </div>
                <br><br>
                <div v-if="uploadDone">
                    <DataTable :value="documentos" :paginator="false">
                        <Column header="DOCUMENTO">
                            <template #body="{ data }">
                                {{ data.archivo }}
                            </template>
                        </Column>
                        <Column header="ENLACES">
                            <template #body="{ data }">
                                <a :href="data.url" @click.prevent="cargarDocumento(data.tipo)">
                                    <i class="pi pi-link"> Ver Documento</i>
                                </a>
                            </template>
                        </Column>
                        <Column v-if="swdoc" header="FIRMAR">
                            <template #body="{ data }">
                                <Button @click="irAFirmar(data.tipo)" severity="info"><i class="pi pi-pencil">
                                        Firmar</i></Button>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <br><br>
                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    REMITIR A CAF
                </h6>
                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite()" :disabled="!uploadDone"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
                </div>
            </div>
            <!-- {{ datosrecividos }} -->
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { createApp, ref, computed, onMounted } from 'vue';
import { globalStore } from '../../../../pages/globalStore'
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import convocatoriaService from '@/services/convocatoria.service'
import documentService from '@/services/document.service';
import { handleUpload, handleUrl, handleDownload } from './Components/driveServiceConvocatoria.js'

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const uploadDone = ref(false);
const seleccion = ref(true)
const tipo = ref()
const urlDoc = ref()
const loading = ref(false)
const obs = datosrecividos.observaciones
const observacion = ref()
const valRef = ref(null)

const nomArchivos = ref(['1. Certificacion de carga horaria']);
const valueArchivos = ref(["certificacion_carga_horaria"]);

const documentosDisponibles = [
    { name: 'DOCENTE(S) INVESTIGADOR(ES) INTERINO(S)', code: 'DOCENTE(S) INVESTIGADOR(ES) INTERINO(S).docx' },
    { name: 'DOCENTE(S) INVESTIGADOR(ES) CONTRATADO(S)', code: 'DOCENTE(S) INVESTIGADOR(ES) CONTRATADO(S).docx' },
    { name: 'DIRECTOR DEL CURSO PREFACULTATIVO DE LA FACULTAD', code: 'DIRECTOR DEL CURSO PREFACULTATIVO DE LA FACULTAD.docx' },
    { name: 'COORDINADOR DEL PROGRAMA DE POSTGRADO', code: 'COORDINADOR DEL PROGRAMA DE POSTGRADO.docx' },
    { name: 'P.E.T.A.E.N.G', code: 'P.E.T.A.E.N.G.docx' }
];
const docDrive = ref(documentosDisponibles[0]);

const documentos = [{ archivo: '1. Convocatoria concurso de meritos', url: urlDoc, tipo: 'convocatoria' }]

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_convocatoria' };
    try {
        const res = await convocatoriaService.obtenerColumna(dat);
        if (res.data != '') {
            uploadDone.value = true
            getDocumentUrl();
        }
    } catch (error) {
        console.error(error);
    }
});

onMounted(async () => {
    tipoConvocatoria();
});

onMounted(async () => {
    if (obs) {
        const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'r_convocatoria' };
        try {
            const res = await convocatoriaService.obtenerColumna(dat);
            if (res.data != '') {
                observacion.value = res.data
            }
        } catch (error) {
            console.error(error);
        }
    }
});

async function tipoConvocatoria() {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'tipo' };
    try {
        const res = await convocatoriaService.obtenerColumna(dat);
        if (res.data != '') {
            seleccion.value = false
            tipo.value = res.data
        }
    } catch (error) {
        console.error(error);
    }
}

async function enviarTramite() {
    const confirmed = confirm('¿Esta seguro de enviar estos datos?');
    if (confirmed) {
        const a = datosrecividos.nrotramite
        const b = datosrecividos.flujo
        const c = datosrecividos.proceso

        let com = ''
        if (obs) {
            com = 'corrección de la convocatoria'
        }

        try {
            const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': com, 'condicion': '' }

            await workflowService.siguienteproceso(env)

        } catch (error) {
            alert(error);
        }



        router.push("/tramite-concluido");
    } else {
        // El usuario canceló
    }

}

async function uploadDocument() {
    loading.value = true
    try {
        const message = await handleUpload(docDrive.value.code, datosrecividos.nrotramite, 'c_convocatoria');
        alert(message);
        uploadDone.value = true;
        if (uploadDone.value) {
            getDocumentUrl();
        }

        seleccion.value = false
        const dat = { 'colum': 'tipo', 'param': docDrive.value.name, 'nrotramite': datosrecividos.nrotramite };
        await convocatoriaService.actulizarColumna(dat)
        tipoConvocatoria();

    } finally {
        loading.value = false
    }

}

async function getDocumentUrl() {
    loading.value = true
    try {
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_convocatoria');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_convocatoria', 'convocatoria', datosrecividos.flujo, 'convocatoria');
        alert(message);
    } finally {
        loading.value = false
    }

}

function redirectDocument() {
    loading.value = true
    try {
        if (!urlDoc.value) {
            console.error("URL no está definida");
            return;
        }
        window.open(urlDoc.value, '_blank');
    } finally {
        loading.value = false
    }

}

async function cargarDocumento(nombreDocumento) {
    try {
        const nt = datosrecividos.nrotramite;
        const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'convocatoria', flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const archivoURL = URL.createObjectURL(archivoBlob);
        window.open(archivoURL, '_blank');
    } catch {
        alert('Descargue el documento antes porfavor')
    }
}

async function irAFirmar(nombreDocumento) {
    try {
        const nt = datosrecividos.nrotramite;
        const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'convocatoria', flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            globalStore.documento = base64data;
            router.push({ name: 'firmar' });
        };
        reader.readAsDataURL(archivoBlob);
    } catch (error) {
        alert('Descargue el documento antes por favor');
    }
}



function redireccionar(url) {
    router.replace(url)
}
</script>