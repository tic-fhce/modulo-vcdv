<template>
    <AppTopbar></AppTopbar>
    <br>
    <!-- <AppMenu></AppMenu> -->
    <div class="layout-main-container">
        <div style="width: 90%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CONVALIDACION DE MATERIAS DE PLAN A PLAN'"></AppDatos>

                <div v-if="swdoc" class="flex justify-content-center p-fluid mt-5 md:flex md:flex-wrap flex-wrap">
                    <div v-for="(documento, index) in nomdocumentos" :key="index" class="field col-12 md:col-4">
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

// const enviarMensaje = () => {
//   const numeroTelefono = "+59176785956"; // Asegúrate de formatear el número correctamente con el código de país
//   const mensaje = encodeURIComponent("Hola"); // Mensaje predeterminado a enviar
//   window.open(`whatsapp://send?phone=${numeroTelefono}&text=${mensaje}`, '_blank');
// };
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import AppMenu from '@/layout/bandeja/AppMenu.vue';
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';

const router = useRouter()
const store = useStore()

const fileUrl = ref([])
const isPDF = ref([false])
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin


const nomArchivos = ["nota_director", "cedula_identidad", "record_academico"]
const nomdocumentos = ['1. Nota dirigida al Director', '2. Cedula de Identidad', '3. Record Academico'];
const imagenesSeleccionadas = Array.from({ length: 3 }, () => ref(null));

async function enviarTramite() {
    if (imagenesSeleccionadas.every(img => img.value !== null)) {
        const confirmed = confirm('¿Está seguro de enviar estos datos?');
        if (confirmed) {
            const a = datosrecividos.nrotramite;
            const enviarSolicitud = async (index) => {
                if (index < imagenesSeleccionadas.length) {
                    const imagen = imagenesSeleccionadas[index];
                    if (imagen && imagen.value !== null) {
                        const formData = new FormData();
                        formData.append('file', imagen.value);
                        formData.append('nombre', nomArchivos[index]);
                        formData.append('nrotramite', a);
                        formData.append('flujo', datosrecividos.flujo);
                        formData.append('tabla', 'convalidacion_01')

                        try {
                            //const r = await convalidacionPlanPlanService.guardarDocumentos(formData)
                            await documentService.guardarDocumentos(formData)
                        } catch (error) {
                            alert(error);
                        }
                    }
                    await enviarSolicitud(index + 1); 
                } else {
                    const env = {'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': a, 'comentario': '', 'condicion': ''};
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
        imagenesSeleccionadas[index].value = nuevaImagen;
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