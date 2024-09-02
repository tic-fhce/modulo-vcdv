<template>
    <AppTopbar></AppTopbar>
    <br>
    <!-- <AppMenu></AppMenu> -->
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">
                    <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

                    <div class="field grid">
                        <label for="name3" class="col-12 mb-2 lg:col-3 lg:mb-0">SELECCIONE LA MODALIDAD DE
                            GRADUACIÓN:</label>
                        <div class="col-12 mb-2 lg:col-2 lg:mb-0">
                            <Dropdown v-model="modalidadSeleccionada" :options="documentosDisponibles"
                                optionLabel="name" placeholder="Seleccione un documento" />
                        </div>
                    </div>

                    <div class="field grid">
                        <label for="titulo" class="col-12 mb-2 lg:col-3 lg:mb-0">TITULO DEL TRABAJO DE GRADO:</label>
                        <div class="col-12 mb-2 lg:col-9 lg:mb-0">
                            <InputText id="titulo" v-model="tituloTrabajo" type="text" placeholder="..." required />
                            <span v-if="tituloError" class="text-red-500">{{ tituloError }}</span>
                        </div>
                    </div>


                    <div class="field grid">
                        <div v-if="swdoc" class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3">
                            <div v-for="(documento, index) in documentos.docs" :key="index"
                                class="col-12 md:col-3 mt-3">
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
                                                class="pi pi-upload">&nbsp;Cargar Documento</i></label>
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
                    <!-- <p @click="enviarMensaje">Haz clic aquí para enviar un mensaje de WhatsApp</p> -->
                </div>
            </div>
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import AppMenu from '@/layout/bandeja/AppMenu.vue';
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service'

const router = useRouter()
const store = useStore()

const fileUrl = ref([]);
const isPDF = ref([]);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const tituloTrabajo = ref('');
const tituloError = ref('');

const documentosDisponibles = [
    { name: 'TESIS', code: 'Tesis' },
    { name: 'TRABAJO DIRIGIDO', code: 'Trabajo Dirigido' },
    { name: 'PROYECTO DE GRADO', code: 'Proyecto de Grado' },
];
const modalidadSeleccionada = ref(documentosDisponibles[0]);

const imagenesSeleccionadas = ref([]);
const documentosBase = [
    '1. Nota dirigida al Director',
    '2. Nota de aceptacion del tutor',
    '3. Fotocopia simple de conclusion de estudios',
    '4. Record academico',
    '5. Perfil de grado'
];
const nomArchivosBase = ["nota_director", "nota_tutor", "conclusion_estudios", "record_academico", "perfil_grado"];

// Lista dinámica de documentos y nombres de archivos basada en la modalidad seleccionada
const documentos = computed(() => {
    const docs = [...documentosBase];
    const archivos = [...nomArchivosBase];
    if (['Trabajo Dirigido', 'Proyecto de Grado'].includes(modalidadSeleccionada.value.code)) {
        docs.push('6. Aceptacion formal de la propuesta por la Institucion o empresa');
        archivos.push('carta_institucion');
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
                            formData.append('nombre', documentos.value.archivos[index]);
                            formData.append('nrotramite', a);
                            formData.append('flujo', datosrecividos.flujo);
                            formData.append('tabla', 'aprobacion_perfil')

                            try {
                                await documentService.guardarDocumentos(formData)
                            } catch (error) {
                                alert(error);
                            }
                        }
                        await enviarSolicitud(index + 1);
                    } else {
                        const d = { 'colum': 'modalidad', 'param': modalidadSeleccionada.value.code, 'nrotramite': a }
                        await aprobacionPerfilService.actulizarColumna(d)
                        const e = { 'colum': 'titulo', 'param': tituloTrabajo.value, 'nrotramite': a }
                        await aprobacionPerfilService.actulizarColumna(e)
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
    } else {
        alert('Por favor, complete todos los campos obligatorios.');
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

function validarFormulario() {
    if (!tituloTrabajo.value.trim()) {
        tituloError.value = 'El título del trabajo de grado es obligatorio.';
        return false;
    } else {
        tituloError.value = '';
    }
    return true;
}

</script>

<style></style>
