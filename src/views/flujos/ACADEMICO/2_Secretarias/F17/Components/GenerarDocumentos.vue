<template>
    <h5>GENERAR DOCUMENTOS PARA LA ATENCION AL TRAMITE</h5>
    <div v-if="loading" class="loading-icon" style="color: red;">
        <i class="pi pi-spin pi-spinner"></i> Espere un momento por favor...
    </div> <br>
    <div class="flex justify-content-left flex-wrap gap-3">
        <Button @click="uploadDocuments" :disabled="uploadDone" severity="success">
            <i class="pi pi-book"></i>&nbsp;Crear Documentos
        </Button>
    </div>
    <br><br>
    <div v-if="uploadDone">
        <DataTable :value="localDocumentos" :paginator="false">
            <Column header="NOMBRE">
                <template #body="{ data }">
                    {{ data.nombre }}
                </template>
            </Column>
            <Column header="EDITAR">
                <template #body="{ data }">
                    <a :href="data.url" @click.prevent="redirectDocument(data)" v-if="data.url">
                        <i class="pi pi-pencil"> Editar Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="EXTRAER DRIVE">
                <template #body="{ data }">
                    <a href="#" @click.prevent="downloadDocument(data)" v-if="data.url">
                        <i class="pi pi-download"> Extraer Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="DOCUMENTO">
                <template #body="{ data }">
                    <a href="#" @click.prevent="verDocumento(data.value)" v-if="data.url">
                        <i class="pi pi-eye"> Ver Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="FIRMAR">
                <template #body="{ data }">
                    <Button @click="firmarDocumento(data)" severity="warning" :disabled="!data.url">
                        <i class="pi pi-pencil"> Firmar</i>
                    </Button>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { ref, watch, onMounted } from 'vue';
import { handleUpload, handleUrl, handleDownload } from './driveServicePerfil';
import documentService from '@/services/document.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';

const props = defineProps({
    documentos: Array,
    swdoc: Boolean
});

const localDocumentos = ref([...props.documentos]);

watch(() => props.documentos, (newDocs) => {
    localDocumentos.value = [...newDocs];
});

const store = useStore()
const datosrecividos = store.getters.getData

const loading = ref(false);
const uploadDone = ref(false);

onMounted(async () => {
    const tD = localDocumentos.value.length;
    let upC = 0;
    try {
        for (const doc of localDocumentos.value) {
            const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_' + doc.value };
            const res = await aprobacionPerfilService.obtenerColumna(dat);
            if (res.data != '') {
                upC++;
            }
        }
        // Verifica si todos los documentos se han cargado
        if (upC === tD) {
            uploadDone.value = true;
            await getDocumentUrls();
        }
    } catch (error) {
        console.error(error);
    }
});


async function uploadDocuments() {
    loading.value = true;

    const totalDocuments = localDocumentos.value.length;
    let uploadedCount = 0;

    try {
        localDocumentos.value.forEach(doc => doc.url = '');

        for (const doc of localDocumentos.value) {
            await handleUpload(doc.archivo, datosrecividos.nrotramite, 'c_' + doc.value);
            uploadedCount++;
        }
        // Verifica si todos los documentos se han cargado
        if (uploadedCount === totalDocuments) {
            alert('Todos los documentos se cargaron correctamente.');
            uploadDone.value = true;
            await getDocumentUrls();
        }
    } finally {
        loading.value = false;
    }
}

async function getDocumentUrls() {
    loading.value = true;
    try {
        for (const doc of localDocumentos.value) {
            const url = await handleUrl(datosrecividos.nrotramite, 'c_' + doc.value);
            // Actualiza la URL en el estado
            const docToUpdate = localDocumentos.value.find(d => d.value === doc.value);
            if (docToUpdate) {
                docToUpdate.url = url;
            }
        }
    } finally {
        loading.value = false;
    }
}

async function downloadDocument(data) {
    loading.value = true;
    try {
        const mensaje = await handleDownload(datosrecividos.nrotramite, 'c_' + data.value, data.value, datosrecividos.flujo, 'aprobacion_perfil');
        alert(mensaje);
    } catch (error) {
        alert('Ocurrió un error al intentar descargar el documento.');
    } finally {
        loading.value = false;
    }
}

function redirectDocument(data) {
    if (!data.url) {
        console.error("URL no está definida para el documento:", data);
        return;
    }
    window.open(data.url, '_blank');
}

async function verDocumento(value) {
    try {
        const nt = datosrecividos.nrotramite;
        const dat = { nombre: value, nrotramite: nt, tabla: 'aprobacion_perfil', flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const archivoURL = URL.createObjectURL(archivoBlob);
        window.open(archivoURL, '_blank');
    } catch {
        alert('Extraiga el documento de Google Drive por favor');
    }
}

async function firmarDocumento(documento) {
    
}


defineExpose({
    uploadDone
});
</script>
