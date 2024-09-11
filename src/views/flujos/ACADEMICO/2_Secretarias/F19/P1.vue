<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">
                    <AppDatos :active="true" :titulo="'CAMBIO DE MODALIDAD, TITULO o TUTOR DE GRADO'"></AppDatos>

                    <!-- Modalidad y Título -->
                    <div class="mt-3 space-y-2">
                        <div class="field">
                            <span class="mr-1 font-bold">Modalidad de Graduacion Actual:</span>
                            <span style="color: blue; font-weight: bold;">{{ modalidadActualSeleccionada }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1 font-bold">Titulo Actual del Trabajo de Grado:</span>
                            <span style="color: blue; font-weight: bold;">{{ tituloActual }}</span>
                        </div>
                    </div>
                    <br />

                    <!-- Selección de Acción -->
                    <div class="field grid">
                        <label for="accion" class="col-12 mb-2 lg:col-3 lg:mb-0">SELECCIONE EL CAMBIO A
                            REALIZAR:</label>
                        <div class="col-12 mb-2 lg:col-4 lg:mb-0">
                            <Dropdown v-model="accionSeleccionada" :options="opcionesCambio" optionLabel="name"
                                placeholder="Seleccione una opción" />
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h5 style="color: red; text-align: center;">SELECCIONE UNA OPCION Y COMPLETE LOS CAMPOS REQUERIDOS
                    </h5><br>
                    <div>
                        <!-- Dropdown para seleccionar modalidad si se cambia la modalidad -->
                        <div class="field grid" v-if="accionSeleccionada.code == 'Modalidad'">
                            <label for="name3" class="col-12 mb-2 lg:col-3 lg:mb-0">SELECCIONE LA MODALIDAD DE
                                GRADUACIÓN:</label>
                            <div class="col-12 mb-2 lg:col-2 lg:mb-0">
                                <Dropdown v-model="modalidadSeleccionada" :options="modalidadesFiltradas"
                                    optionLabel="name" placeholder="Seleccione una modalidad" />
                            </div>
                        </div>

                        <!-- Campos para cambiar título y cargar documentos específicos -->
                        <div class="field grid"
                            v-if="accionSeleccionada.code == 'Modalidad' || accionSeleccionada.code == 'Titulo'">
                            <label for="titulo" class="col-12 mb-2 lg:col-3 lg:mb-0">TITULO DEL TRABAJO DE
                                GRADO:</label>
                            <div class="col-12 mb-2 lg:col-9 lg:mb-0">
                                <InputText id="titulo" v-model="tituloTrabajo" type="text"
                                    placeholder="Ingrese el nuevo título" required />
                                <span v-if="tituloError" class="text-red-500">{{ tituloError }}</span>
                            </div>
                        </div>

                        <!-- Documentos requeridos según la opción seleccionada -->
                        <div class="field grid"
                            v-if="accionSeleccionada.code == 'Modalidad' || accionSeleccionada.code == 'Titulo' || accionSeleccionada.code == 'Tutor'">
                            <div v-if="swdoc" class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3"
                                style="width: 100%;">
                                <div v-for="(documento, index) in documentosFiltrados" :key="index"
                                    class="col-12 md:col-3 mt-3">
                                    <div class="center-content" style="border: 2px solid rgba(221, 221, 221, 0.937);">
                                        <div class="preview-container">
                                            <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                                class="preview">
                                            <iframe v-else-if="isPDF[index]" :src="fileUrl[index]"
                                                class="preview"></iframe>
                                            <img v-else :src="fileUrl[index]" class="preview">
                                        </div>
                                        <div class="doc" style="padding-top: 10px;">
                                            <h5>{{ documento }}</h5>
                                            <label :for="'file-upload-' + index" class="custom-file-upload">
                                                <i class="pi pi-upload">&nbsp;Cargar Documento</i>
                                            </label>
                                            <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                                @change="handleFileUpload(index, $event)" style="display: none;">
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
                                :disabled="accionSeleccionada.code !== 'Modalidad' && accionSeleccionada.code !== 'Titulo' && accionSeleccionada.code !== 'Tutor'">
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
            <span class="ml-3">Enviando, espere porfavor...</span>
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
import cambioModalidadService from '@/services/cambioModalidad.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

const router = useRouter();
const store = useStore();

const fileUrl = ref([]);
const isPDF = ref([]);
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;

const tituloActual = ref('');
const modalidadActualSeleccionada = ref();
const perfilId = ref();
const tituloTrabajo = ref('');
const tituloError = ref('');

const modalidadesFiltradas = ref([]);
const modalidadSeleccionada = ref(null);

// Opciones para cambio
const opcionesCambio = [
    { name: 'Seleccione una opción', code: '' },
    { name: 'Cambio de Modalidad de Graduación', code: 'Modalidad' },
    { name: 'Cambio de Título de Grado', code: 'Titulo' },
    { name: 'Cambio de Tutor de Grado', code: 'Tutor' }
];
const accionSeleccionada = ref(opcionesCambio[0]);

const documentosDisponibles = [
    { name: 'TESIS', code: 'Tesis' },
    { name: 'TRABAJO DIRIGIDO', code: 'Trabajo Dirigido' },
    { name: 'PROYECTO DE GRADO', code: 'Proyecto de Grado' }
];

// Inicialización de datos al montar el componente
onMounted(async () => {
    try {
        const { data } = await designacionTribunalService.obtenerPerfilGrado();
        modalidadActualSeleccionada.value = data[0].modalidad;
        tituloActual.value = data[0].titulo;
        perfilId.value = data[0].id;

        actualizarModalidadesFiltradas();
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Función para actualizar las modalidades filtradas
function actualizarModalidadesFiltradas() {
    modalidadesFiltradas.value = documentosDisponibles.filter(modalidad => modalidad.code !== modalidadActualSeleccionada.value);
    modalidadSeleccionada.value = modalidadesFiltradas.value.length > 0 ? modalidadesFiltradas.value[0] : null;
}

// Documentos base para las diferentes modalidades
const documentosBase = [
    '1. Nota dirigida al Director',
    '2. Nota de aceptación del tutor',
    '3. Perfil de grado'
];
const nomArchivosBase = ref(["nota_director", "nota_tutor", "perfil_grado"]);
const imagenesSeleccionadas = Array.from({ length: 3 }, () => ref(null));


// Lista dinámica de documentos y nombres de archivos basada en la modalidad seleccionada
const documentosFiltrados = computed(() => {
    const docs = [...documentosBase];
    if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidadSeleccionada.value.code)) {
        docs.push('4. Aceptación formal de la propuesta por la Institución o empresa');
        nomArchivosBase.value = ["nota_director", "nota_tutor", "perfil_grado", "carta_institucion"];
    }
    imagenesSeleccionadas.value = Array.from({ length: docs.length }, () => ref(null));
    return docs;
});


async function enviarTramite() {
    if (validarFormulario()) {
        if (imagenesSeleccionadas.value.every(img => img.value !== null)) {
            const confirmed = confirm('¿Está seguro de enviar estos datos?');
            if (confirmed) {
                const a = datosrecividos.nrotramite;
                const enviarSolicitud = async (index) => {
                    if (index < imagenesSeleccionadas.value.length) {
                        const imagen = imagenesSeleccionadas.value[index];
                        if (imagen && imagen.value !== null) {
                            const formData = new FormData();
                            formData.append('file', imagen.value);
                            formData.append('nombre', nomArchivosBase.value[index]);
                            formData.append('nrotramite', a);
                            formData.append('flujo', datosrecividos.flujo);
                            formData.append('tabla', 'cambio_modalidad');

                            try {
                                await documentService.guardarDocumentos(formData);
                            } catch (error) {
                                alert(error);
                            }
                        }
                        await enviarSolicitud(index + 1);
                    } else {
                        const col1 = { colum: 'aprobacion_perfil_id', param: perfilId.value, nrotramite: a };
                        await cambioModalidadService.actulizarColumna(col1);

                        const col2 = { colum: 'cambio', param: accionSeleccionada.value.code, nrotramite: a };
                        await cambioModalidadService.actulizarColumna(col2);

                        if (accionSeleccionada.value.code == 'Modalidad') {
                            let x = modalidadSeleccionada.value.code;
                            let y = tituloTrabajo.value;

                            const col3 = { colum: 'n_modalidad', param: x, nrotramite: a };
                            const col4 = { colum: 'n_titulo', param: y, nrotramite: a };
                            await cambioModalidadService.actulizarColumna(col3);
                            await cambioModalidadService.actulizarColumna(col4);

                        } else if (accionSeleccionada.value.code == 'Titulo') {
                            let z = tituloTrabajo.value;

                            const col5 = { colum: 'n_titulo', param: z, nrotramite: a };
                            await cambioModalidadService.actulizarColumna(col5);
                        }

                        const env = { flujo: datosrecividos.flujo, proceso: datosrecividos.proceso, tramiteId: a, comentario: '', condicion: '' };
                        const response = await workflowService.siguienteproceso(env);
                        if (response) {
                            await generarHojaDeRuta(a);
                        }
                    }
                };
                await enviarSolicitud(0);
            }
        } else {
            alert('Cargue los documentos requeridos, por favor');
        }
    } else {
        alert('Por favor, complete todos los campos obligatorios.');
    }
}

function redireccionar(url) {
    router.replace(url);
}

// Manejo de la carga de archivos
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

function validarFormulario() {
    if ((accionSeleccionada.value.code === 'Titulo' || accionSeleccionada.value.code === 'Modalidad') && !tituloTrabajo.value.trim()) {
        tituloError.value = 'El título del trabajo de grado es obligatorio.';
        return false;
    }
    return true;
}

async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: '' };

    loadingModal.value = true;
    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/hoja-ruta");
    } catch (error) {
        alert('Error al generar la hoja de ruta', error);
        redireccionar("/tramite-pendiente");
    } finally {
        loadingModal.value = false;
    }
}
</script>

<style></style>
