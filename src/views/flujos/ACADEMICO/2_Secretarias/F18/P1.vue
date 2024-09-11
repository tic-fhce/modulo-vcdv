<template>
    <AppTopbar />
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">
                    <AppDatos :active="true" :titulo="'DESIGNACION DE TRIBUNAL REVISOR DE GRADO'" />

                    <!-- Modalidad y Título -->
                    <div class="mt-3 space-y-2">
                        <div class="field">
                            <span class="mr-1 font-bold">Modalidad de Graduacion:</span>
                            <span style="color: blue; font-weight: bold;">{{ modalidadSeleccionada }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1 font-bold">Titulo del Trabajo de Grado:</span>
                            <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                        </div>
                    </div>
                    <br />

                    <!-- Sección de Documentos -->
                    <div class="field grid" v-if="swdoc">
                        <div class="flex flex-wrap justify-content-center gap-3 w-full" style="width: 100%;">
                            <div v-for="(documento, index) in documentos.docs" :key="index" class="col-12 md:col-3 mt-3">
                                <div class="center-content border-2 border-gray-300">
                                    <div class="preview-container">
                                        <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png" class="preview">
                                        <iframe v-else-if="isPDF[index]" :src="fileUrl[index]" class="preview"></iframe>
                                        <img v-else :src="fileUrl[index]" class="preview">
                                    </div>
                                    <div class="doc pt-2">
                                        <h5>{{ documento }}</h5>
                                        <label :for="'file-upload-' + index" class="custom-file-upload">
                                            <i class="pi pi-upload">&nbsp;Cargar Documento</i>
                                        </label>
                                        <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                            @change="handleFileUpload(index, $event)" class="hidden">
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
            <span class="ml-3">Enviando, espere porfavor...</span>
        </div>
    </Dialog>
    <AppFooter />
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';

// Componentes
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';

// Servicios
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

// Variables reactivas
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const fileUrl = ref([]);
const isPDF = ref([]);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const perfilId = ref();
const titulo = ref('');
const modalidadSeleccionada = ref('Tesis');

// Lista de documentos y archivos
const documentosBase = ['1. Nota de suficiencia del tutor', '2. Trabajo de Grado'];
const nomArchivosBase = ["nota_suficiencia_tutor", "trabajo_grado"];
const imagenesSeleccionadas = Array.from({ length: 2 }, () => ref(null));

// Computed para manejar la lista dinámica de documentos
const documentos = computed(() => {
    const docs = [...documentosBase];
    const archivos = [...nomArchivosBase];
    if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidadSeleccionada.value)) {
        docs.push('3. Carta de conclusion de la Institucion o empresa');
        archivos.push('carta_conclusion_institucion');
    }
    imagenesSeleccionadas.value = Array.from({ length: docs.length }, () => ref(null));
    return { docs, archivos };
});

// Inicialización de datos al montar el componente
onMounted(async () => {
    try {
        const { data } = await designacionTribunalService.obtenerPerfilGrado();
        modalidadSeleccionada.value = data[0].modalidad;
        titulo.value = data[0].titulo;
        perfilId.value = data[0].id;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
});

// Observador para actualizar la lista de documentos si la modalidad cambia
watch(documentos, () => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
}, { immediate: true });

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

// Función para enviar el trámite
async function enviarTramite() {
    if (imagenesSeleccionadas.value.every(img => img.value !== null)) {
        if (confirm('¿Está seguro de enviar estos datos?')) {
            await enviarDocumentos(0);
        }
    } else {
        alert('Cargue los documentos requeridos porfavor.');
    }
}

// Enviar documentos de forma recursiva
async function enviarDocumentos(index) {
    if (index < imagenesSeleccionadas.value.length) {
        const imagen = imagenesSeleccionadas.value[index];
        if (imagen && imagen.value !== null) {
            const formData = new FormData();
            formData.append('file', imagen.value);
            formData.append('nombre', documentos.value.archivos[index]);
            formData.append('nrotramite', datosrecividos.nrotramite);
            formData.append('flujo', datosrecividos.flujo);
            formData.append('tabla', 'designacion_tribunal');

            try {
                await documentService.guardarDocumentos(formData);
            } catch (error) {
                alert('Error al guardar el documento: ' + error);
            }
        }
        await enviarDocumentos(index + 1);
    } else {
        await actualizarColumna();
    }
}

// Actualizar columna en el backend
async function actualizarColumna() {
    const dat = { 'colum': 'aprobacion_perfil_id', 'param': perfilId.value, 'nrotramite': datosrecividos.nrotramite };
    const env = { flujo: datosrecividos.flujo, proceso: datosrecividos.proceso, tramiteId: datosrecividos.nrotramite, comentario: '', condicion: '' };
    try {
        await designacionTribunalService.actulizarColumna(dat);
        const response = await workflowService.siguienteproceso(env);
        if (response) {
            await generarHojaDeRuta(datosrecividos.nrotramite);
        }
    } catch (error) {
        alert('Error al actualizar la columna: ' + error);
    }
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

// Redireccionar a otra página
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Estilos personalizados aquí */
</style>
