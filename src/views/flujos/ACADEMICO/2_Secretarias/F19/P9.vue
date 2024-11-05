<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">

                    <AppDatos :active="true" :titulo="'APROBACIÓN DE PERFIL DE GRADO'"></AppDatos>

                    <div class="card">
                        <h5 style="text-decoration: underline;">DATOS DEL PERFIL DE GRADO</h5><br>
                        <div class="mt-3 space-y-2">
                            <div class="field">
                                <span class="mr-1" style="font-weight: bold;">Modalidad de Graduacion:</span>
                                <span style="color: blue; font-weight: bold;">{{ modalidad }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1" style="font-weight: bold;">Titulo del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                            </div>
                            <div class="field">
                                <span class="mr-1" style="font-weight: bold;">Tutor del Trabajo de Grado:</span>
                                <span style="color: blue; font-weight: bold;">{{ tutor }}</span>
                            </div>
                        </div><br>
                    </div>

                    <ListaArchivos :key="listaArchivosKey" ref="valRef" :valueArchivos="valueArchivos"
                        :nomArchivos="nomArchivos" :mostrarObservacionesProp="true" :tabla="'aprobacion_perfil'"
                        :nomDivision="'DOCUMENTOS'" />

                    <br><br>

                    <div class="field grid">
                        <div class="flex flex-row gap-3">
                            <Button v-if="swdoc" @click="corregir()" :disabled="corregido">Corregir</Button>
                        </div>
                    </div>

                    <div class="card" style="background-color: rgb(250, 250, 250);">
                        <h5>DOCUMENTOS PENDIENTES DE CORRECCIÓN</h5>
                        <div class="field grid" v-if="swdoc">
                            <div class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3"
                                style="width: 100%;">
                                <div v-for="(documento, index) in nomdocumentos" :key="index"
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
                                                @change="handleFileUpload(index, $event)" style="display: none;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="field grid">
                        <div v-if="!swdoc" class="flex flex-row gap-3">
                            <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                                    class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                        </div>
                        <div v-else class="flex flex-row gap-3">
                            <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                                    class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                            <Button @click="enviarTramite()"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
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
import { ref, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';
import workflowService from '@/services/workflow.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import documentService from '@/services/document.service';
import editDocumentService from '@/services/editDocument.service';

// Variables reactivas
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const corregido = ref(false);
const valRef = ref(null);
const fileUrl = ref([]);
const isPDF = ref([]);
const listaArchivosKey = ref(0);

const modalidad = ref()
const titulo = ref()
const tutor = ref()

const nomArchivos = ref([
    '1. Nota dirigida al Director',
    '2. Nota de aceptacion del tutor',
    '3. Fotocopia simple de conclusion de estudios',
    '4. Record academico',
    '5. Perfil de grado'
]);
const valueArchivos = ref([
    "nota_director",
    "nota_tutor",
    "conclusion_estudios",
    "record_academico",
    "perfil_grado"
]);
const nomdocumentos = ref([]);
const nomArch = ref([]);
const imagenesSeleccionadas = ref([]);

// Hook onMounted
onMounted(async () => {
    try {
        const { data } = await aprobacionPerfilService.obtenerAprobacionPerfil({ 'nrotramite': datosrecividos.nrotramite });
        modalidad.value = data.modalidad;
        titulo.value = data.titulo;
        tutor.value = data.tutor;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Watcher para modalidad
watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('6. Aceptacion formal de la propuesta por la Institucion o empresa');
        valueArchivos.value.push('carta_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

// Funciones principales
function corregir() {
    if (!corregido.value) {
        const x = valRef.value.tabla;
        const archivosConObservaciones = x.filter(doc => doc.observaciones !== 'correcto');
        nomdocumentos.value = archivosConObservaciones.map(doc => doc.archivo);
        nomArch.value = archivosConObservaciones.map(doc => doc.enlaces[0].nombre);
        imagenesSeleccionadas.value = Array.from({ length: nomdocumentos.value.length }, () => ref(null));
        corregido.value = true;
    }
}

async function enviarTramite() {
    if (imagenesSeleccionadas.value.every(img => img.value !== null)) {
        const confirmed = confirm('¿Está seguro de enviar estos datos?');
        if (confirmed) {
            await procesarEnvio();
        }
    } else {
        alert('Cargue los documentos requeridos porfavor');
    }
}

async function procesarEnvio() {
    const a = datosrecividos.nrotramite;
    const enviarSolicitud = async (index) => {
        if (index < imagenesSeleccionadas.value.length) {
            await guardarDocumento(index, a);
            await enviarSolicitud(index + 1);
        } else {
            const env = {
                'flujo': datosrecividos.flujo,
                'proceso': datosrecividos.proceso,
                'tramiteId': a,
                'comentario': 'correccion de datos',
                'condicion': ''
            };
            const response = await workflowService.siguienteproceso(env);
            if (response) {
                await generarHojaDeRuta(a);
            }
        }
    };
    await enviarSolicitud(0);
}

async function guardarDocumento(index, nroTramite) {
    const imagen = imagenesSeleccionadas.value[index];
    if (imagen && imagen.value !== null) {
        const formData = new FormData();
        formData.append('file', imagen.value);
        formData.append('nombre', nomArch.value[index]);
        formData.append('nrotramite', nroTramite);
        formData.append('flujo', datosrecividos.flujo);
        formData.append('tabla', 'aprobacion_perfil');
        try {
            await documentService.guardarDocumentos(formData);
        } catch (error) {
            alert(error);
        }
    }
}

async function generarHojaDeRuta(nroTramite) {
    const p = datosrecividos.proceso;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: ' -  corrección' };

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

// Funciones auxiliares
function redireccionar(url) {
    router.replace(url);
}

const handleFileUpload = (index, event) => {
    const nuevaImagen = event.target.files[0];
    if (nuevaImagen) {
        imagenesSeleccionadas.value[index] = ref(nuevaImagen);
        const reader = new FileReader();
        reader.onload = (e) => {
            fileUrl.value.splice(index, 1, e.target.result);
        };
        reader.readAsDataURL(nuevaImagen);
        isPDF.value.splice(index, 1, nuevaImagen.type === 'application/pdf');
    }
};

</script>

<style scoped>
/* Puedes agregar tus estilos aquí */
</style>
