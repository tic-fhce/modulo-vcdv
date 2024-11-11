<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">
                    <AppDatos :active="true" :titulo="'CAMBIO DE MODALIDAD, TÍTULO o TUTOR DE GRADO'"></AppDatos>

                    <div class="card">
                        <h5 style="text-decoration: underline;">DATOS DEL ANTERIOR PERFIL DE GRADO</h5><br>
                        <div class="mt-3 space-y-2">
                            <div class="field">
                                <span class="mr-1 font-bold">Modalidad de Graduación:</span>
                                <span style="color: blue; font-weight: bold;">{{ uModalidad }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1 font-bold">Título del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ uTitulo }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1 font-bold">Tutor del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ uTutor }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h5 style="text-decoration: underline;">CAMBIOS DEL PERFIL DE GRADO</h5><br>
                    <div class="field grid">
                        <label for="accion" class="col-12 mb-2 lg:col-3 lg:mb-0">SELECCIONE EL CAMBIO A
                            REALIZAR:</label>
                        <div class="col-12 mb-2 lg:col-4 lg:mb-0">
                            <Dropdown v-model="accionSeleccionada" :options="opcionesCambio" optionLabel="name"
                                placeholder="Seleccione una opción" />
                        </div>
                    </div>

                    <!-- Input para el nuevo tutor, visible solo al seleccionar 'Tutor' -->
                    <div class="field grid" v-if="accionSeleccionada.code === 'Tutor'">
                        <label for="nuevoTutor" class="col-12 mb-2 lg:col-3 lg:mb-0">NOMBRE DEL NUEVO TUTOR:</label>
                        <div class="col-12 mb-2 lg:col-9 lg:mb-0">
                            <InputText id="nuevoTutor" v-model="nuevoTutor" type="text"
                                placeholder="Ingrese el nombre del nuevo tutor" required />
                            <span v-if="nuevoTutorError" class="text-red-500">{{ nuevoTutorError }}</span>
                        </div>
                    </div>

                    <!-- Dropdown para seleccionar modalidad si se cambia la modalidad -->
                    <div class="field grid" v-if="accionSeleccionada.code === 'Modalidad'">
                        <label for="modalidad" class="col-12 mb-2 lg:col-3 lg:mb-0">SELECCIONE LA MODALIDAD DE
                            GRADUACIÓN:</label>
                        <div class="col-12 mb-2 lg:col-2 lg:mb-0">
                            <Dropdown v-model="modalidadSeleccionada" :options="modalidadesFiltradas" optionLabel="name"
                                placeholder="Seleccione una modalidad" />
                        </div>
                    </div>

                    <!-- Campos para cambiar título y cargar documentos específicos -->
                    <div class="field grid"
                        v-if="accionSeleccionada.code === 'Modalidad' || accionSeleccionada.code === 'Titulo'">
                        <label for="titulo" class="col-12 mb-2 lg:col-3 lg:mb-0">TÍTULO DEL TRABAJO DE
                            GRADO:</label>
                        <div class="col-12 mb-2 lg:col-9 lg:mb-0">
                            <InputText id="titulo" v-model="tituloTrabajo" type="text"
                                placeholder="Ingrese el nuevo título" required />
                            <span v-if="tituloError" class="text-red-500">{{ tituloError }}</span>
                        </div>
                    </div>

                    <!-- Documentos requeridos según la opción seleccionada -->
                    <div class="card" style="background-color: rgb(250, 250, 250);">
                        <h5>REQUISITOS DEL TRÁMITE</h5>
                        <div class="field grid"
                            v-if="(accionSeleccionada.code === 'Modalidad' && modalidadSeleccionada) || accionSeleccionada.code === 'Titulo' || accionSeleccionada.code === 'Tutor'">
                            <div v-if="swdoc" class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3"
                                style="width: 100%;">
                                <div v-for="(documento, index) in documentosFiltrados" :key="index"
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field grid">
                        <div v-if="!swdoc" class="flex flex-row gap-3">
                            <Button @click="redireccionar('/tramite-concluido')" severity="warning">
                                <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                            </Button>
                        </div>
                        <div v-else class="flex flex-row gap-3">
                            <Button @click="redireccionar('/tramite-pendiente')" severity="warning">
                                <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                            </Button>
                            <Button @click="enviarTramite()"
                                :disabled="!accionSeleccionada.code || (accionSeleccionada.code === 'Tutor' && !nuevoTutor) || (accionSeleccionada.code === 'Modalidad' && !modalidadSeleccionada)">
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
            <span class="ml-3">Enviando, por favor espere...</span>
        </div>
    </Dialog>
    <AppFooter></AppFooter>
</template>
<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
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

const router = useRouter();
const store = useStore();

const fileUrl = ref([]);
const isPDF = ref([]);
const loadingModal = ref(false);
const datosrecividos = store.getters.getData || {};
const swdoc = !datosrecividos.fechafin;

const uModalidad = ref(null);
const uTitulo = ref(null);
const uTutor = ref(null);

const tituloTrabajo = ref(null);
const tituloError = ref(null);

const modalidadSeleccionada = ref(null);

const nuevoTutor = ref(null);
const nuevoTutorError = ref(null);

const opcionesCambio = [
    { name: 'Seleccione una opción', code: '' },
    { name: 'Cambio de Modalidad de Graduación', code: 'Modalidad' },
    { name: 'Cambio de Título de Grado', code: 'Titulo' },
    { name: 'Cambio de Tutor de Grado', code: 'Tutor' }
];
const accionSeleccionada = ref(opcionesCambio[0]);

const modalidadesDisponibles = [
    { name: 'TESIS', code: 'Tesis' },
    { name: 'TRABAJO DIRIGIDO', code: 'Trabajo Dirigido' },
    { name: 'PROYECTO DE GRADO', code: 'Proyecto de Grado' }
];

const documentosBase = [
    '1. Nota dirigida al Director',
    '2. Nota de aceptación del tutor',
    '3. Perfil de grado'
];
const documentosTutor = [
    '1. Nota de renuncia del tutor',
    '2. Nota de aceptación del tutor'
];
const documentosExtraModalidad = [
    '4. Aceptación formal de la propuesta por la Institución o empresa'
];
const nomArchivosBaseModalidadTitulo = ["nota_director", "nota_tutor", "perfil_grado"];
const nomArchivosBaseTutor = ["nota_renuncia_tutor", "nota_tutor"];
const nomArchivosBaseExtraModalidad = ["carta_institucion"];
const imagenesSeleccionadas = ref([]);

const nomArchivosBase = ref([]);

onMounted(async () => {
    await DatosPerfilGrado();
});

async function DatosPerfilGrado() {
    try {
        const { data } = await aprobacionPerfilService.obtenerUltimaAprobacionPerfil();
        uModalidad.value = data.modalidad;
        uTitulo.value = data.titulo;
        uTutor.value = data.tutor;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se encontraron datos del anterior Perfil.',
            life: 3000
        });
    }
}

const modalidadesFiltradas = computed(() => {
    if (accionSeleccionada.value.code !== 'Modalidad') return [];
    return modalidadesDisponibles.filter(modalidad => modalidad.code !== uModalidad.value);
});

const documentosFiltrados = computed(() => {
    let docs = [];
    let archivosBase = [];

    if (accionSeleccionada.value.code === 'Modalidad') {
        if (modalidadSeleccionada.value) {
            docs = [...documentosBase];
            archivosBase = [...nomArchivosBaseModalidadTitulo];

            if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidadSeleccionada.value.code)) {
                docs.push(...documentosExtraModalidad);
                archivosBase.push(...nomArchivosBaseExtraModalidad);
            }
        }
    } else if (accionSeleccionada.value.code === 'Titulo') {
        docs = [...documentosBase];
        archivosBase = [...nomArchivosBaseModalidadTitulo];

        if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(uModalidad.value)) {
            docs.push(...documentosExtraModalidad);
            archivosBase.push(...nomArchivosBaseExtraModalidad);
        }
    } else if (accionSeleccionada.value.code === 'Tutor') {
        docs = [...documentosTutor];
        archivosBase = [...nomArchivosBaseTutor];
    }

    nomArchivosBase.value = [...archivosBase];
    imagenesSeleccionadas.value = Array(docs.length).fill(null);
    return docs;
});

function handleFileUpload(index, event) {
    const nuevaImagen = event.target.files[0];
    if (nuevaImagen) {
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!tiposPermitidos.includes(nuevaImagen.type)) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Tipo de archivo no permitido. Solo se permiten PDF e imágenes.',
                life: 3000
            });
            return;
        }

        // tamaño del archivo
        const tamañoMaximo = 5 * 1024 * 1024; // 5MB
        if (nuevaImagen.size > tamañoMaximo) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El tamaño del archivo excede el límite permitido de 5MB.',
                life: 3000
            });
            return;
        }

        imagenesSeleccionadas.value[index] = nuevaImagen;
        const reader = new FileReader();
        reader.onload = (e) => {
            fileUrl.value[index] = e.target.result;
        };
        reader.readAsDataURL(nuevaImagen);
        isPDF.value[index] = nuevaImagen.type === 'application/pdf';
    }
}

function validarFormulario() {
    tituloError.value = '';
    nuevoTutorError.value = '';

    let esValido = true;

    if ((accionSeleccionada.value.code === 'Titulo' || accionSeleccionada.value.code === 'Modalidad') && !tituloTrabajo.value.trim()) {
        tituloError.value = 'El título del trabajo de grado es obligatorio.';
        esValido = false;
    }

    if (accionSeleccionada.value.code === 'Modalidad' && !modalidadSeleccionada.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Por favor, seleccione la nueva modalidad de graduación.',
            life: 3000
        });
        esValido = false;
    }

    if (accionSeleccionada.value.code === 'Tutor' && !nuevoTutor.value.trim()) {
        nuevoTutorError.value = 'El nombre del nuevo tutor es obligatorio.';
        esValido = false;
    }

    return esValido;
}

async function enviarTramite() {
    if (validarFormulario()) {
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
    } else {
        toast.add({ severity: 'warn', summary: 'Advertencia ', detail: 'Por favor, complete todos los campos obligatorios.', life: 3000 });
    }
}

async function procesarEnvioTramite() {
    const nroTramite = datosrecividos.nrotramite;
    try {
        loadingModal.value = true;

        let cambio = accionSeleccionada.value.code;
        let data;
        if (cambio === 'Modalidad') {
            data = {
                nrotramite: nroTramite,
                cambio_resolucion: cambio,
                modalidad: modalidadSeleccionada.value.code,
                titulo: tituloTrabajo.value,
                tutor: uTutor.value
            };
        } else if (cambio === 'Titulo') {
            data = {
                nrotramite: nroTramite,
                cambio_resolucion: cambio,
                modalidad: uModalidad.value,
                titulo: tituloTrabajo.value,
                tutor: uTutor.value
            };
        } else if (cambio === 'Tutor') {
            data = {
                nrotramite: nroTramite,
                cambio_resolucion: cambio,
                modalidad: uModalidad.value,
                titulo: uTitulo.value,
                tutor: nuevoTutor.value
            };
        }
        const response = await aprobacionPerfilService.crearAprobaciónPerfil(data);

        if (response) {
            for (let index = 0; index < imagenesSeleccionadas.value.length; index++) {
                await guardarDocumento(index);
            }
            await avanzarProceso(nroTramite);
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Al procesar el trámite', life: 3000 });
    } finally {
        loadingModal.value = false;
    }
}

async function guardarDocumento(index) {
    const imagen = imagenesSeleccionadas.value[index];
    if (imagen) {
        const formData = new FormData();
        formData.append('file', imagen);
        formData.append('nombre', nomArchivosBase.value[index]);
        formData.append('nrotramite', datosrecividos.nrotramite);
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

// Función para redireccionar
function redireccionar(url) {
    router.replace(url);
}

// Función para generar la hoja de ruta
async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: '' };

    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al generar la hoja de ruta: ${error.message}`,
            life: 3000
        });
        redireccionar("/tramite-pendiente");
    }
}
</script>
