<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="grid p-fluid">
                <div class="card">

                    <AppDatos :active="true" :titulo="'SOLICITUD DE CERTIFICADO DE CONCLUSIÓN DE ESTUDIOS'"></AppDatos>

                    <div class="card" style="background-color: rgb(250, 250, 250);">
                        <h5>REQUISITOS DEL TRÁMITE</h5>
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
                    <!-- <p @click="enviarMensaje">Haz clic aquí para enviar un mensaje de WhatsApp</p> -->
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
import { ref } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import editDocumentService from '@/services/editDocument.service';
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';

const router = useRouter()
const store = useStore()
const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);

const fileUrl = ref([])
const isPDF = ref([false])
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const nomArchivos = ['valorada', 'cedula_identidad', 'certificado_unico']
const nomdocumentos = ['1. Valorada del Certificado', '2. Cedula de Identidad', '3. Certificado Unico Calificaciones'];
const imagenesSeleccionadas = Array.from({ length: 3 }, () => ref(null));


async function enviarTramite() {
    if (imagenesSeleccionadas.every(img => img.value !== null)) {
        confirm.require({
            message: 'Está seguro de enviar estos datos',
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            accept: async () => {
                try {
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
                                formData.append('tabla', 'certificado_conclusion')

                                try {
                                    await documentService.guardarDocumentos(formData)
                                    // await convalidacionPlanPlanService.guardarDocumentos(formData)
                                } catch (error) {
                                    alert(error);
                                }
                            }
                            await enviarSolicitud(index + 1);
                        } else {
                            const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': a, 'comentario': '', 'condicion': '' };
                            const response = await workflowService.siguienteproceso(env);
                            if (response) {
                                await generarHojaDeRuta();
                            }
                            redireccionar("/hoja-ruta")
                        }
                    };
                    await enviarSolicitud(0);
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                }
            }
        });
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Cargue los documentos requeridos porfavor', life: 3000 });
    }
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

async function generarHojaDeRuta() {
    const nt = datosrecividos.nrotramite;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: '' };

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

function redireccionar(url) {
    router.replace(url)
}

</script>

<style></style>