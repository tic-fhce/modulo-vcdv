<template>
    <AppTopbar></AppTopbar>
    <br>
    <Toast />
    <ConfirmDialog />
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCION DE MATERIAS EXTRA'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarObservacionesProp="true" :tabla="'materia_extra'" />
                <br><br>
                <Button v-if="swdoc" @click="corregir()" :disabled="corregido">Corregir</Button>

                <div class="card" style="background-color: rgb(250, 250, 250);">
                    <h5>DOCUMENTOS PENDIENTES DE CORRECCIÓN</h5>
                    <div class="field grid" v-if="swdoc">
                        <div class="flex flex-wrap md:flex md:flex-wrap justify-content-center gap-3"
                            style="width: 100%;">
                            <div v-for="(documento, index) in nomdocumentos" :key="index" class="field col-3 md:col-3">
                                <div class="center-content" style="border: 2px solid rgba(221, 221, 221, 0.937);">
                                    <div class="preview-container">
                                        <img v-if="!fileUrl[index]" src="@/assets/images/img_document.png"
                                            class="preview">
                                        <iframe v-else-if="isPDF[index]" :src="fileUrl[index]" class="preview"></iframe>
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

                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-pendiente')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
                    <Button @click="enviarTramite"><i class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
                </div>

            </div>
            <!-- {{ datosrecividos }} -->
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
import { createApp, ref, computed, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()
const store = useStore()
const confirm = useConfirm();
const toast = useToast();


const loadingModal = ref(false);
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
        const archivosConObservaciones = x.filter(doc => doc.observaciones !== 'correcto');
        nomdocumentos.value = archivosConObservaciones.map(doc => doc.archivo); // Asignación de `nomdocumentos`
        nomArchivos2.value = archivosConObservaciones.map(doc => doc.enlaces[0].nombre);
        imagenesSeleccionadas.value = Array.from({ length: nomdocumentos.value.length }, () => ref(null));
        corregido.value = true;
        swbot.value = true
    }
}


async function enviarTramite() {
    if (imagenesSeleccionadas.value.length > 0 && imagenesSeleccionadas.value.every(img => img.value !== null)) {
        confirm.require({
            message: 'Está seguro de enviar estos datos',
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            accept: async () => {
                try {
                    const enviarSolicitud = async (index) => {
                        if (index < imagenesSeleccionadas.value.length) {
                            const imagen = imagenesSeleccionadas.value[index];
                            if (imagen && imagen.value) {
                                const formData = new FormData();
                                formData.append('file', imagen.value);
                                formData.append('nombre', nomArchivos2.value[index]);
                                formData.append('nrotramite', datosrecividos.nrotramite);
                                formData.append('flujo', datosrecividos.flujo);
                                formData.append('tabla', 'alumno_libre');

                                try {
                                    await documentService.guardarDocumentos(formData);
                                } catch (error) {
                                    alert('Error al guardar el documento: ' + error.message);
                                }
                            }
                            await enviarSolicitud(index + 1);
                        } else {
                            const env = { 'flujo': datosrecividos.flujo, 'proceso': datosrecividos.proceso, 'tramiteId': datosrecividos.nrotramite, 'comentario': 'correccion de documentos', 'condicion': '' };
                            const response = await workflowService.siguienteproceso(env);
                            if (response) {
                                await generarHojaDeRuta();
                            }
                            redireccionar("/hoja-ruta");
                        }
                    };
                    await enviarSolicitud(0);
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                }
            }
        });
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor, cargue todos los documentos requeridos.', life: 3000 });
    }
}

async function generarHojaDeRuta() {
    const nt = datosrecividos.nrotramite;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: ' -  corrección' };

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