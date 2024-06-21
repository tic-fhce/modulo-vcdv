<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">
                <AppDatos :titulo="'CONVOCATORIA DE CONCURSO DE MERITOS PARA DOCENTES'"></AppDatos>

                <ListaArchivos ref="valRef" :mostrarRevision="true" :valueArchivos="valueArchivos"
                    :nomArchivos="nomArchivos" :tabla="'convocatoria'" />
                <br><br>
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
const uploadDone = ref(false);
const urlDoc = ref()
const loading = ref(false)
const docDrive = 'NOTA DE ATENCION CONVOCATORIA.docx'

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const documentos = [{ archivo: '1. Nota de atencion', url: urlDoc, tipo: 'nota_atencion' }]

const nomArchivos = ref(['1. Convocatoria concurso de meritos']);
const valueArchivos = ref(["convocatoria"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_nota_atencion' };
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
    if (valRef.value.validarRadioButtons()) {
        //if (uploadDone.value) {
            const confirmed = confirm('¿Esta seguro de enviar estos datos?');
            if (confirmed) {
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
                        const dat = { columna: valueArchivos.value[index], observacion: obs, nrotramite: nt, tabla: 'convocatoria' };
                        await documentService.actualizarobservacionDocumentos(dat);

                        await enviarSolicitud(index + 1);
                    } else {
                        const b = datosrecividos.flujo
                        const c = datosrecividos.proceso
                        try {
                            const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': comentario.value, 'condicion': cond.value }
                            await workflowService.siguienteproceso(env)
                        } catch (error) {
                            alert(error);
                        }
                        redireccionar("/tramite-pendiente")

                    }
                };
                await enviarSolicitud(0);
            } else {
                // El usuario canceló
            }
        // } else {
        //     alert("genere la nota porfavor")
        // }
    }
}

async function uploadDocument() {
    loading.value = true
    try {
        const message = await handleUpload(docDrive, datosrecividos.nrotramite, 'c_nota_atencion');
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
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_nota_atencion');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_nota_atencion', 'nota_atencion', datosrecividos.flujo, 'convocatoria');
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