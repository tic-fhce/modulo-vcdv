<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">

                    <AppDatos :active="true" :titulo="'DESIGNACION DE TRIBUNAL REVISOR DE GRADO'"></AppDatos>

                    <div class="mt-3 space-y-2">
                        <div class="field">
                            <span class="mr-1" style="font-weight: bold;">Modalidad de Graduacion:</span>
                            <span style="color: blue; font-weight: bold;">{{ modalidad }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1" style="font-weight: bold;">Titulo del Trabajo de Grado:</span>
                            <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                        </div>
                    </div><br>

                    <ListaArchivos :key="listaArchivosKey" ref="valRef" :valueArchivos="valueArchivos"
                        :nomArchivos="nomArchivos" :mostrarObservacionesProp="true" :tabla="'designacion_tribunal'"
                        :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />

                    <br><br>

                    <div class="field grid">
                        <div class="flex flex-row gap-3">
                            <Button v-if="swdoc" @click="corregir()" :disabled="corregido">Corregir</Button>
                        </div>
                    </div>

                    <div class="field grid">
                        <div v-if="swdoc" class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3">
                            <div v-for="(documento, index) in nomdocumentos" :key="index"
                                :class="{ 'col-12': true, 'md:col-8': nomdocumentos.length === 1, 'md:col-3': nomdocumentos.length > 1, 'md:col-3': true, 'mt-3': true }">
                                <div class="center-content" style="border: 2px solid rgba(221, 221, 221, 0.937);">
                                    <div class="preview-container">
                                        <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                            class="preview">
                                        <iframe v-else-if="isPDF[index]" :src="fileUrl[index]" class="preview"></iframe>
                                        <img v-else :src="fileUrl[index]" class="preview">
                                    </div>
                                    <div class="doc" style="padding-top: 10px;">
                                        <h5>{{ documento }}</h5>
                                        <label :for="'file-upload-' + index" class="custom-file-upload"> <i
                                                class="pi pi-upload">&nbsp;Cargar Documento</i>
                                        </label>
                                        <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                            @change="handleFileUpload(index, $event)" style="display: none;">
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
            <!-- {{ datosrecividos }} -->
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import designacionTribunalService from '@/services/designacionTribunal.service';

const router = useRouter();
const store = useStore();
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const corregido = ref(false);
const modalidad = ref(null);
const titulo = ref(null);
const valRef = ref(null);
const fileUrl = ref([]);
const isPDF = ref([]);

const listaArchivosKey = ref(0);

const nomArchivos = ref(['1. Nota de suficiencia del tutor', '2. Trabajo de Grado']);
const valueArchivos = ref(["nota_suficiencia_tutor", "trabajo_grado"]);

const nomdocumentos = ref([]); // Definición de `nomdocumentos`
const nomArch = ref([]);
const imagenesSeleccionadas = ref([]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'aprobacion_perfil_id' };
    try {
        const idP = await designacionTribunalService.obtenerColumna(dat);
        const { data } = await designacionTribunalService.obtenerPerfilGradoId({ idPerfil: idP.data })

        titulo.value = data[0].titulo
        modalidad.value = data[0].modalidad
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('3. Carta de conclusion de la Institucion o empresa');
        valueArchivos.value.push('carta_conclusion_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

function corregir() {
    if (!corregido.value) {
        const x = valRef.value.tabla;
        const archivosConObservaciones = x.filter(doc => doc.observaciones !== 'correcto');
        nomdocumentos.value = archivosConObservaciones.map(doc => doc.archivo); // Asignación de `nomdocumentos`
        nomArch.value = archivosConObservaciones.map(doc => doc.enlaces[0].nombre);
        imagenesSeleccionadas.value = Array.from({ length: nomdocumentos.value.length }, () => ref(null));
        corregido.value = true;
    }
}

async function enviarTramite() {
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
                        formData.append('nombre', nomArch.value[index]);
                        formData.append('nrotramite', a);
                        formData.append('flujo', datosrecividos.flujo);
                        formData.append('tabla', 'designacion_tribunal')

                        try {
                            await documentService.guardarDocumentos(formData)
                        } catch (error) {
                            alert(error);
                        }
                    }
                    await enviarSolicitud(index + 1);
                } else {
                    const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': a, 'comentario': 'correccion de datos del estudiante', 'condicion': '' };
                    await workflowService.siguienteproceso(env);
                    redireccionar("/tramite-concluido")
                }
            };
            await enviarSolicitud(0);
        } else {
            // El usuario canceló
        }
    } else {
        alert('Cargue los documentos requeridos porfavor');
    }
}

function redireccionar(url) {
    router.replace(url)
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
