<template>
    <AppTopbar></AppTopbar>
    <br>
    <!-- <AppMenu></AppMenu> -->
    <div class="layout-main-container">
        <div style="width: 90%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'DESIGNACION DE DOCENTES INTERINOS'"></AppDatos>

                <h5>DOCENTES APROBADOS</h5>
                <DataTable :value="orderlistValue" class="p-datatable-gridlines">
                    <Column field="docente" header="Docente"></Column>
                    <Column field="ci" header="C.I."></Column>
                    <Column field="celular" header="Celular"></Column>
                    <Column field="doc1" header="Documento 1"></Column>
                    <Column field="doc2" header="Documento 2"></Column>
                    <Column field="doc3" header="Documento 3"></Column>
                </DataTable>
            </div>

            <div class="card">
                <h5>GENERAR EL PROYECTO DE RESOLUCION</h5>
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
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppMenu from '@/layout/bandeja/AppMenu.vue';
import AppDatos from './Components/Datos.vue';
import workflowService from '@/services/workflow.service';
import { handleUpload, handleUrl, handleDownload } from './Components/driveServiceDesignacion'
import designacionDocInterinos from '@/services/designacionDocInterinos.service'
import documentService from '@/services/document.service'

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const uploadDone = ref(false);
const urlDoc = ref()
const loading = ref(false)
const docDrive = ref('PROYECTO DE RESOLUCION DESIGNACION DOCENTES INTERINOS.docx')

const documentos = [{ archivo: '1. Proyecto de Resolucion', url: urlDoc, tipo: 'proy_resolucion' }]

const orderlistValue = ref([
    { docente: 'Docente 1', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
    { docente: 'Docente 2', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
    { docente: 'Docente 3', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_proy_resolucion' };
    try {
        const res = await designacionDocInterinos.obtenerColumna(dat);
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

function redireccionar(url) {
    router.replace(url)
}


async function uploadDocument() {
    loading.value = true
    try {
        const message = await handleUpload(docDrive.value, datosrecividos.nrotramite, 'c_proy_resolucion');
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
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_proy_resolucion');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_proy_resolucion', 'proy_resolucion', datosrecividos.flujo, 'designacion_doc_interinos');
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
        const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'designacion_doc_interinos', flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const archivoURL = URL.createObjectURL(archivoBlob);
        window.open(archivoURL, '_blank');
    } catch {
        alert('Descargue el documento antes porfavor')
    }

}

</script>

<style></style>