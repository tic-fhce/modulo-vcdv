<template>
    <AppTopbar></AppTopbar>
    <br>
    <!-- <AppMenu></AppMenu> -->
    <div class="layout-main-container">
        <div style="width: 90%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'DESIGNACION DE TRIBUNAL REVISOR DE GRADO'"></AppDatos>

                <div class="mt-3 space-y-2">
                    <div class="field">
                        <span class="mr-1" style="font-weight: bold;">Modalidad de Graduacion:</span>
                        <span style="color: blue; font-weight: bold;">{{ modalidadSeleccionada }}</span>
                    </div>
                    <div class="field">
                        <span class="mr-1" style="font-weight: bold;">Titulo del Trabajo de Grado:</span>
                        <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                    </div>
                </div><br> 


                <div v-if="swdoc" class="flex justify-content-center p-fluid mt-5 md:flex md:flex-wrap flex-wrap">
                    <div v-for="(documento, index) in documentos.docs" :key="index" class="field col-12 md:col-4">
                        <div class="center-content">
                            <div class="preview-container">
                                <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                    class="preview">
                                <iframe v-else-if="isPDF[index]" :src="fileUrl[index]" class="preview"></iframe>
                                <img v-else :src="fileUrl[index]" class="preview">
                            </div>
                            <div class="doc">
                                <h5>{{ documento }}</h5>
                                <label :for="'file-upload-' + index" class="custom-file-upload"> Cargar Documento
                                </label>
                                <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                    @change="handleFileUpload(index, $event)" style="display: none;">
                            </div>
                        </div>
                    </div>
                </div>
                <br><br>

                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite()"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
                </div>
                <!-- <p @click="enviarMensaje">Haz clic aquí para enviar un mensaje de WhatsApp</p> -->
            </div>
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service'
import designacionTribunalService from '@/services/designacionTribunal.service';

const router = useRouter()
const store = useStore()

const fileUrl = ref([])
const isPDF = ref([false])
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const perfilId = ref()
const titulo = ref()
const modalidadSeleccionada = ref('Tesis');

const imagenesSeleccionadas = Array.from({ length: 2 }, () => ref(null));
const documentosBase = [
    '1. Nota de suficiencia del tutor',
    '2. Trabajo de Grado'
];
const nomArchivosBase = ["nota_suficiencia_tutor", "trabajo_grado"];


onMounted(async () => {
    try {
        const { data } = await designacionTribunalService.obtenerPerfilGrado()
        modalidadSeleccionada.value = data[0].modalidad
        titulo.value = data[0].titulo
        perfilId.value = data[0].id
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Lista dinámica de documentos y nombres de archivos basada en la modalidad seleccionada
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

onMounted(() => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
});

watch(documentos, () => {
    fileUrl.value = Array(documentos.value.docs.length).fill(null);
    isPDF.value = Array(documentos.value.docs.length).fill(false);
}, { immediate: true });

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
                        formData.append('nombre', documentos.value.archivos[index]);
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
                    const dat = { 'colum': 'aprobacion_perfil_id', 'param': perfilId.value, 'nrotramite': a}
                    await designacionTribunalService.actulizarColumna(dat)

                    const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': a, 'comentario': '', 'condicion': '' };
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
    if (index >= 0 && index < fileUrl.value.length) {
        const nuevaImagen = event.target.files[0];
        if (nuevaImagen) {
            imagenesSeleccionadas.value[index].value = nuevaImagen;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!fileUrl.value[index]) {
                    fileUrl.value[index] = e.target.result;
                } else {
                    fileUrl.value.splice(index, 1, e.target.result);
                }
            };
            reader.readAsDataURL(nuevaImagen);

            if (!isPDF.value[index]) {
                isPDF.value[index] = nuevaImagen.type === 'application/pdf';
            } else {
                isPDF.value.splice(index, 1, nuevaImagen.type === 'application/pdf');
            }
        }
    }
};

</script>

<style></style>