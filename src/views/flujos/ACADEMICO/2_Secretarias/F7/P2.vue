<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA DE CONCURSO DE MERITOS PARA DOCENTES'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :tabla="'convocatoria'" />
                <br><br>
                <h5>GENERAR LA CERTIFICACION DE CARGA HORARIA</h5>
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
                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite()" :disabled="!uploadDone"><i
                            class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
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
const uploadDone = ref(false);
const urlDoc = ref()
const loading = ref(false)
const docDrive = 'CERTIFICACION CARGA HORARIA.docx'

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const documentos = [{ archivo: '1. Certificacion de carga horaria', url: urlDoc, tipo: 'certificacion_carga_horaria' }]

const nomArchivos = ref(['1. Convocatoria concurso de meritos']);
const valueArchivos = ref(["convocatoria"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_certificacion_carga_horaria' };
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

async function enviarTramite() {
    const confirmed = confirm('¿Esta seguro de enviar estos datos?');
    if (confirmed) {
        const a = datosrecividos.nrotramite
        const b = datosrecividos.flujo
        const c = datosrecividos.proceso

        try {
            const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': '', 'condicion': '' }

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
        const message = await handleUpload(docDrive, datosrecividos.nrotramite, 'c_certificacion_carga_horaria');
        alert(message);
        uploadDone.value = true;
        if (uploadDone.value) {
            getDocumentUrl();
        }
    } finally {
        loading.value = false
    }

}

async function getDocumentUrl() {
    loading.value = true
    try {
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_certificacion_carga_horaria');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_certificacion_carga_horaria', 'certificacion_carga_horaria', datosrecividos.flujo, 'convocatoria');
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