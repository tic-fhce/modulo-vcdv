<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'CONCURSO DE MERITOS DE DOCENTES INTERINOS'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'concurso_doc_interinos'" />
                <br><br>
            </div>

            <div class="card">
                <h5>GENERAR LA NOTA DE ATENCION</h5>
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
                                <Button @click="firmarDocumento(data)" severity="info"><i class="pi pi-pencil">
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
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import concursoDocInterinos from '@/services/concursoDocInterinos.service'
import documentService from '@/services/document.service';
import { handleUpload, handleUrl, handleDownload } from './Components/driveServiceConcurso'

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const uploadDone = ref(false);
const urlDoc = ref()
const loading = ref(false)
const docDrive = ref('NOTA CONCURSO MERITOS DOCENTES INTERINOS.docx')


const documentos = [{ archivo: '1. Nota de atencion', url: urlDoc, tipo: 'nota_vic' }]

const nomArchivos = ref(['1. Nota de solicitud', '2. Respaldo']);
const valueArchivos = ref(["solicitud", "respaldo"]);


onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_nota_vic' };
    try {
        const res = await concursoDocInterinos.obtenerColumna(dat);
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
        const message = await handleUpload(docDrive.value, datosrecividos.nrotramite, 'c_nota_vic');
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
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_nota_vic');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_nota_vic', 'nota_vic', datosrecividos.flujo, 'concurso_doc_interinos');
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
        const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'concurso_doc_interinos', flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const archivoURL = URL.createObjectURL(archivoBlob);
        window.open(archivoURL, '_blank');
    } catch {
        alert('Descargue el documento antes porfavor')
    }

}

async function firmarDocumento(documento) {

}


function redireccionar(url) {
    router.replace(url)
}
</script>