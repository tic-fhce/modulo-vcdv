<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">
                    <AppDatos :active="true" :titulo="'APROBACIÓN DE PERFIL DE GRADO'"></AppDatos>

                    <div class="card" style="background-color: rgb(250, 250, 250);">
                        <h5 style="color: blue; text-decoration: underline;">REQUISITOS DEL TRÁMITE</h5>

                        <div class="field grid">
                            <label for="modalidad" class="col-12 mb-2 lg:col-4 lg:mb-0">
                                SELECCIONE LA MODALIDAD DE GRADUACIÓN:
                            </label>
                            <div class="col-12 mb-2 lg:col-3 lg:mb-9">
                                <Dropdown id="modalidad" v-model="modalidadSeleccionada"
                                    :options="documentosDisponibles" optionLabel="name"
                                    placeholder="Seleccione una modalidad" required />
                                <span v-if="modalidadError" class="text-red-500">{{ modalidadError }}</span>
                            </div>
                        </div>

                        <!-- Sección de Título del Trabajo de Grado -->
                        <div class="field grid">
                            <label for="titulo" class="col-12 mb-2 lg:col-4 lg:mb-0">TÍTULO DEL TRABAJO DE
                                GRADO:</label>
                            <div class="col-12 mb-2 lg:col-8 lg:mb-0">
                                <InputText id="titulo" v-model="tituloTrabajo" type="text"
                                    placeholder="Título del trabajo de grado" required />
                                <span v-if="tituloError" class="text-red-500">{{ tituloError }}</span>
                            </div>
                        </div>

                        <!-- Sección de Tutor del Trabajo de Grado -->
                        <div class="field grid">
                            <label for="tutor" class="col-12 mb-2 lg:col-4 lg:mb-0">TUTOR DEL TRABAJO DE
                                GRADO:</label>
                            <div class="col-12 mb-2 lg:col-8 lg:mb-0">
                                <InputText id="tutor" v-model="tutorTrabajo" type="text"
                                    placeholder="Tutor del trabajo de grado" required />
                                <span v-if="tutorError" class="text-red-500">{{ tutorError }}</span>
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
                                        <div class="center-content"
                                            style="border: 2px solid rgba(221, 221, 221, 0.937);">
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
                                                    @change="handleFileUpload(index, $event)"
                                                    style="display: none;"><br>
                                                <span v-if="documentosError[index]" class="text-red-500">
                                                    {{ documentosError[index] }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Botones -->
                    <div class="field grid">
                        <div class="flex flex-row gap-3" v-if="!swdoc">
                            <Button @click="redireccionar('/tramite-concluido')" severity="warning">
                                <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                            </Button>
                        </div>
                        <div class="flex flex-row gap-3" v-else>
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
    <AppFooter></AppFooter>
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
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import editDocumentService from '@/services/editDocument.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

// Variables y referencias
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const fileUrl = ref([]);
const isPDF = ref([]);
const documentosError = ref([]); // Para manejar errores en la carga de documentos
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const tituloTrabajo = ref('');
const tutorTrabajo = ref('');
const tituloError = ref('');
const tutorError = ref('');
const modalidadError = ref(''); // Error para modalidad

// Documentos y modalidad
const documentosDisponibles = [
    { name: 'TESIS', code: 'Tesis' },
    { name: 'TRABAJO DIRIGIDO', code: 'Trabajo Dirigido' },
    { name: 'PROYECTO DE GRADO', code: 'Proyecto de Grado' },
];
const modalidadSeleccionada = ref(documentosDisponibles[0]);

const imagenesSeleccionadas = ref([]);
const documentosBase = [
    '1. Nota dirigida al Director',
    '2. Nota de aceptación del tutor',
    '3. Fotocopia simple de conclusión de estudios',
    '4. Record académico',
    '5. Perfil de grado'
];
const nomArchivosBase = ["nota_director", "nota_tutor", "conclusion_estudios", "record_academico", "perfil_grado"];

// Lista dinámica de documentos y nombres de archivos basada en la modalidad seleccionada
const documentos = computed(() => {
    const docs = [...documentosBase];
    const archivos = [...nomArchivosBase];
    if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidadSeleccionada.value.code)) {
        docs.push('6. Aceptación formal de la propuesta por la Institución o empresa');
        archivos.push('carta_institucion');
    }
    imagenesSeleccionadas.value = Array.from({ length: docs.length }, () => ref(null));
    documentosError.value = Array.from({ length: docs.length }, () => '');
    return { docs, archivos };
});

// Hooks
onMounted(() => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
});

watch(documentos, () => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
    documentosError.value = Array.from({ length: documentos.value.docs.length }, () => '');
}, { immediate: true });

// Funciones principales
async function enviarTramite() {
    if (validarFormulario()) {
        if (validarDocumentos()) {
            confirm.require({
                message: 'Está seguro de enviar estos datos',
                header: 'Confirmación',
                icon: 'pi pi-question-circle',
                accept: async () => {
                    try {
                        await procesarEnvioTramite();
                    } catch (error) {
                        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                    }
                }
            });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Advertencia ', detail: 'Por favor, complete todos los campos obligatorios.', life: 3000 });
    }
}

function validarDocumentos() {
    let allUploaded = true;
    documentosError.value = documentos.value.docs.map((doc, index) => {
        if (!imagenesSeleccionadas.value[index].value) {
            allUploaded = false;
            return 'Este documento es obligatorio.';
        }
        return '';
    });
    return allUploaded;
}

async function procesarEnvioTramite() {
    const nroTramite = datosrecividos.nrotramite;
    try {
        loadingModal.value = true;

        const data = {
            nrotramite: nroTramite,
            modalidad: modalidadSeleccionada.value.code,
            titulo: tituloTrabajo.value.trim(),
            tutor: tutorTrabajo.value.trim()
        };
        const response = await aprobacionPerfilService.crearAprobaciónPerfil(data);

        if (response) {
            for (let index = 0; index < imagenesSeleccionadas.value.length; index++) {
                await guardarDocumento(index, nroTramite);
            }
            await avanzarProceso(nroTramite);
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Al procesar el trámite', life: 3000 });
    } finally {
        loadingModal.value = false;
    }
}

async function guardarDocumento(index, nroTramite) {
    const imagen = imagenesSeleccionadas.value[index].value;
    if (imagen) {
        const formData = new FormData();
        formData.append('file', imagen);
        formData.append('nombre', documentos.value.archivos[index]);
        formData.append('nrotramite', nroTramite);
        formData.append('flujo', datosrecividos.flujo);
        formData.append('tabla', 'aprobacion_perfil');
        try {
            await documentService.guardarDocumentos(formData);
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Al guardar el documento', life: 3000 });
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
        toast.add({ severity: 'error', summary: 'Error', detail: 'Al generar la hoja de ruta', life: 3000 });
        redireccionar("/tramite-pendiente");
    }
}

// Handlers y Validaciones
const handleFileUpload = (index, event) => {
    if (index >= 0 && index < fileUrl.value.length) {
        const nuevaImagen = event.target.files[0];
        if (nuevaImagen) {
            imagenesSeleccionadas.value[index].value = nuevaImagen;
            const reader = new FileReader();
            reader.onload = (e) => {
                fileUrl.value.splice(index, 1, e.target.result);
            };
            reader.readAsDataURL(nuevaImagen);
            isPDF.value.splice(index, 1, nuevaImagen.type === 'application/pdf');
        }
    }
};

function validarFormulario() {
    let isValid = true;
    if (!modalidadSeleccionada.value) {
        modalidadError.value = 'La modalidad de graduación es obligatoria.';
        isValid = false;
    } else {
        modalidadError.value = '';
    }

    if (!tituloTrabajo.value.trim()) {
        tituloError.value = 'El título del trabajo de grado es obligatorio.';
        isValid = false;
    } else {
        tituloError.value = '';
    }

    if (!tutorTrabajo.value.trim()) {
        tutorError.value = 'El tutor del trabajo de grado es obligatorio.';
        isValid = false;
    } else {
        tutorError.value = '';
    }

    return isValid;
}

function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped></style>
