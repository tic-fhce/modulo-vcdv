<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar />
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">

                    <AppDatos :active="true" :titulo="'DESIGNACIÓN DE TRIBUNAL REVISOR DE GRADO'" />

                    <!-- Datos del Perfil de Grado -->
                    <div class="card">
                        <h5 style="text-decoration: underline;">DATOS DEL PERFIL DE GRADO</h5><br>
                        <div class="mt-3 space-y-2">
                            <div class="field">
                                <span class="mr-1 font-bold">Modalidad de Graduación:</span>
                                <span style="color: blue; font-weight: bold;">{{ modalidad }}</span>
                                <span v-if="modalidadError" class="text-red-500">{{ modalidadError }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1 font-bold">Título del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                                <span v-if="tituloError" class="text-red-500">{{ tituloError }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1 font-bold">Tutor del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ tutor }}</span>
                                <span v-if="tutorError" class="text-red-500">{{ tutorError }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Documentos -->
                    <div class="card" style="background-color: rgb(250, 250, 250);">
                        <h5>REQUISITOS DEL TRÁMITE</h5>
                        <div class="field grid" v-if="swdoc">
                            <div class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3"
                                style="width: 100%;">
                                <div v-for="(documento, index) in documentos.docs" :key="index"
                                    class="field col-3 md:col-3">
                                    <div class="center-content" style="border: 2px solid rgba(221, 221, 221, 0.937);">
                                        <div class="preview-container">
                                            <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                                class="preview">
                                            <iframe v-else-if="isPDF[index]" :src="fileUrl[index]"
                                                class="preview"></iframe>
                                            <img v-else :src="fileUrl[index]" class="preview">
                                        </div>
                                        <div class="doc" style="padding-top: 10px;">
                                            <h6>{{ documento }}</h6>
                                            <label :for="'file-upload-' + index" class="custom-file-upload"> Cargar
                                                Documento
                                            </label>
                                            <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                                @change="handleFileUpload(index, $event)" style="display: none;"><br>
                                            <span v-if="documentosError[index]" class="text-red-500">
                                                {{ documentosError[index] }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Botones -->
                    <div class="field grid">
                        <div class="flex gap-3" v-if="!swdoc">
                            <Button @click="redireccionar('/tramite-concluido')" severity="warning">
                                <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                            </Button>
                        </div>
                        <div class="flex gap-3" v-else>
                            <Button @click="redireccionar('/tramite-pendiente')" severity="warning">
                                <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                            </Button>
                            <Button @click="enviarTramite()">
                                <i class="pi pi-arrow-right text">Enviar&nbsp;</i>
                            </Button>
                        </div>
                    </div>
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
    <AppFooter />
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const fileUrl = ref([]);
const isPDF = ref([]);
const documentosError = ref([]);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const listaArchivosKey = ref(0);

const modalidad = ref('');
const titulo = ref('');
const tutor = ref('');

const modalidadError = ref('');
const tituloError = ref('');
const tutorError = ref('');

const documentosBase = [
    '1. Nota de suficiencia del tutor',
    '2. Trabajo de Grado'
];
const nomArchivosBase = ["nota_suficiencia_tutor", "trabajo_grado"];
const imagenesSeleccionadas = ref([]);

const documentos = computed(() => {
    const docs = [...documentosBase];
    const archivos = [...nomArchivosBase];
    if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidad.value)) {
        docs.push('3. Carta de conclusión de la Institución o empresa');
        archivos.push('carta_conclusion_institucion');
    }
    if (imagenesSeleccionadas.value.length !== docs.length) {
        imagenesSeleccionadas.value = Array.from({ length: docs.length }, () => ref(null));
        documentosError.value = Array.from({ length: docs.length }, () => '');
    }
    return { docs, archivos };
});

onMounted(async () => {
    await DatosPerfilGrado();

    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
});

watch(documentos, () => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
    documentosError.value = Array.from({ length: documentos.value.docs.length }, () => '');
}, { immediate: true });

async function DatosPerfilGrado() {
    try {
        const { data } = await designacionTribunalService.obtenerDesignacionTribunal({ 'nrotramite': datosrecividos.nrotramite });
        if (!data) {
            const { data: nuevaData } = await designacionTribunalService.crearDesignacionTribunal({ 'nrotramite': datosrecividos.nrotramite });
            modalidad.value = nuevaData.aprobacion_Perfil.modalidad;
            titulo.value = nuevaData.aprobacion_Perfil.titulo;
            tutor.value = nuevaData.aprobacion_Perfil.tutor;
        } else {
            modalidad.value = data.aprobacion_Perfil.modalidad;
            titulo.value = data.aprobacion_Perfil.titulo;
            tutor.value = data.aprobacion_Perfil.tutor;
        }
    } catch (error) {
        toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo obtener los datos del perfil de grado.', life: 3000});
    }
}

function handleFileUpload(index, event) {
    const nuevaImagen = event.target.files[0];
    if (nuevaImagen) {
        imagenesSeleccionadas.value[index].value = nuevaImagen;
        const reader = new FileReader();
        reader.onload = (e) => {
            fileUrl.value[index] = e.target.result;
        };
        reader.readAsDataURL(nuevaImagen);

        isPDF.value[index] = nuevaImagen.type === 'application/pdf';
    }
}

async function enviarTramite() {
    if (imagenesSeleccionadas.value.every(img => img.value !== null)) {
        confirm.require({
            message: '¿Está seguro de enviar estos datos?',
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            accept: async () => {
                try {
                    await procesarEnvioTramite();
                    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Trámite enviado correctamente.', life: 3000 });
                    redireccionar("/tramite-pendiente");
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar el trámite.', life: 3000 });
                }
            }
        });
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Cargue los documentos requeridos porfavor', life: 3000 });
    }

}

async function procesarEnvioTramite() {
    const nroTramite = datosrecividos.nrotramite;
    try {
        loadingModal.value = true;
        for (let index = 0; index < imagenesSeleccionadas.value.length; index++) {
            await guardarDocumento(index, nroTramite);
        }
        await avanzarProceso(nroTramite);
    } catch (error) {
        console.error('Error al procesar el trámite:', error);
        throw error;
    } finally {
        loadingModal.value = false;
    }
}

// Guardar un documento específico
async function guardarDocumento(index, nroTramite) {
    const imagen = imagenesSeleccionadas.value[index].value;
    if (imagen) {
        const formData = new FormData();
        formData.append('file', imagen);
        formData.append('nombre', documentos.value.archivos[index]);
        formData.append('nrotramite', nroTramite);
        formData.append('flujo', datosrecividos.flujo);
        formData.append('tabla', 'designacion_tribunal');

        try {
            await documentService.guardarDocumentos(formData);
        } catch (error) {
            console.error(`Error al guardar el documento ${documentos.value.docs[index]}:`, error);
            documentosError.value[index] = 'Error al subir este documento.';
            throw error;
        }
    }
}

async function avanzarProceso(nroTramite) {
    const env = {
        flujo: datosrecividos.flujo,
        proceso: datosrecividos.proceso,
        tramiteId: nroTramite,
        comentario: '',
        condicion: ''
    };
    try {
        const response = await workflowService.siguienteproceso(env);
        if (response) {
            await generarHojaDeRuta(nroTramite);
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo avanzar al siguiente proceso', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Al avanzar el proceso', life: 3000 });
    }
}

async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: '' };

    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        console.error('Error al generar la hoja de ruta:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al generar la hoja de ruta. Redirigiendo al trámite pendiente.',
            life: 3000
        });
        redireccionar("/tramite-pendiente");
    }
}

function redireccionar(url) {
    router.replace(url);
}
</script>
