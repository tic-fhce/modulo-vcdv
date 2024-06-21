<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'" />
                <br><br>
            </div>

            <div class="card">
                <h5>GENERAR EL PROYECTO DE RESOLUCION Y FIRMARLO PARA ENVIAR A LA SIGUIENTE UNIDAD</h5>
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
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import documentService from '@/services/document.service';
import { handleUpload, handleUrl, handleDownload } from './Components/driveServicePerfil'

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const uploadDone = ref(false);
const urlDoc = ref()
const loading = ref(false)

const documentos = [{ archivo: '1. Proyecto de resolucion de perfil de grado', url: urlDoc, tipo: 'proyecto_resolucion_perfil' }]

const nomArchivos = ref(['1. Nota dirigida al Director', '2. Nota de aceptacion del tutor', '3. Fotocopia simple de conclusion de estudios', '4. Record academico', '5. Perfil de grado']);
const valueArchivos = ref(["nota_director", "nota_tutor", "conclusion_estudios", "record_academico", "perfil_grado"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'modalidad' };
    try {
        modalidad.value = await aprobacionPerfilService.obtenerColumna(dat);
        if (modalidad.value.data != 'Tesis') {
            nomArchivos.value.push('6. Carta de aceptacion de propuesta por la Institucion o empresa')
            valueArchivos.value.push('carta_institucion')
        }
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_proyecto_resolucion_perfil' };
    try {
        const res = await aprobacionPerfilService.obtenerColumna(dat);
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
        const message = await handleUpload('proyecto resolucion aprobacion de perfil de grado.docx', datosrecividos.nrotramite, 'c_proyecto_resolucion_perfil');
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
        urlDoc.value = await handleUrl(datosrecividos.nrotramite, 'c_proyecto_resolucion_perfil');
    } finally {
        loading.value = false
    }
}


async function downloadDocument() {
    loading.value = true
    try {
        const message = await handleDownload(datosrecividos.nrotramite, 'c_proyecto_resolucion_perfil', 'proyecto_resolucion_perfil', datosrecividos.flujo, 'aprobacion_perfil');
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
        const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'aprobacion_perfil', flujo: datosrecividos.flujo };
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