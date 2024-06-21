<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCION DE MATERIAS EXTRA'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarObservacionesProp="true" :tabla="'materia_extra'"/>
                <br><br>
                <Button v-if="swdoc" @click="corregir()" :disabled="corregido">Corregir</Button>

                <div v-if="swdoc" class="flex justify-content-center p-fluid mt-5 md:flex md:flex-wrap">
                    <div v-for="(documento, index) in nomdocumentos" :key="index" class="field col-3 md:col-3">
                        <div class="center-content">
                            <div class="preview-container">
                                <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                    class="preview">
                                <iframe v-else-if="isPDF[index]" :src="fileUrl[index]" class="preview"></iframe>
                                <img v-else :src="fileUrl[index]" class="preview">
                            </div>
                            <div class="doc">
                                <h4>{{ documento }}</h4>
                                <label :for="'file-upload-' + index" class="custom-file-upload"> Cargar Documento
                                </label>
                                <input :id="'file-upload-' + index" accept=".pdf, image/*" type="file"
                                    @change="handleFileUpload(index, $event)" style="display: none;">
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite()"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
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
import documentService from '@/services/document.service';

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const swbot = ref(false)
const corregido = ref(false);
const cond = ref('no')

const valRef = ref(null)
const fileUrl = ref([])
const isPDF = ref([false])

const nomArchivos2 = ref([]);
const nomdocumentos = ref([]);
const imagenesSeleccionadas = ref([]);

const nomArchivos = ref(['1. Nota de solicitud', '2. Respaldo']);
const valueArchivos = ref(["solicitud", "respaldo"]);

function corregir() {
    if (!corregido.value) {
        const x = valRef.value.tabla;
        for (let i = 0; i < x.length; i++) {
            if (x[i].observaciones !== 'correcto') {
                nomArchivos2.value.push(x[i].enlaces[0].nombre);
                nomdocumentos.value.push(x[i].archivo);
            }
        }
        imagenesSeleccionadas.value = Array.from({ length: nomArchivos2.value.length }, () => ref(null));
        corregido.value = true;
        swbot.value = true
    }
}


async function enviarTramite() {
    if (imagenesSeleccionadas.value.every(imgRef => imgRef.value)) {
        const confirmed = confirm('¿Está seguro de enviar estos datos?');
        if (confirmed) {
            const enviarSolicitud = async (index) => {
                if (index < imagenesSeleccionadas.value.length) {
                    const imagen = imagenesSeleccionadas.value[index];
                    if (imagen && imagen.value) {
                        const formData = new FormData();
                        formData.append('file', imagen.value);
                        formData.append('nombre', nomArchivos2.value[index]);
                        formData.append('nrotramite', datosrecividos.nrotramite);
                        formData.append('flujo', datosrecividos.flujo);
                        formData.append('tabla', 'materia_extra');

                        try {
                            await documentService.guardarDocumentos(formData);
                        } catch (error) {
                            alert('Error al guardar el documento: ' + error.message);
                        }
                    }
                    await enviarSolicitud(index + 1);
                } else {
                    const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': datosrecividos.nrotramite, 'comentario': 'correccion de documentos', 'condicion': '' };
                    await workflowService.siguienteproceso(env)
                    redireccionar("/tramite-concluido");
                }
            };
            await enviarSolicitud(0);
        } else {
            // El usuario canceló la acción
        }
    } else {
        alert('Por favor, cargue todos los documentos requeridos.');
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
            fileUrl.value[index] = e.target.result; // Guardar la URL de la imagen en el array correspondiente
        };
        reader.readAsDataURL(nuevaImagen);

        isPDF.value[index] = nuevaImagen.type === 'application/pdf'; // Verificar si la imagen es PDF
    }
};

</script>

<style></style>