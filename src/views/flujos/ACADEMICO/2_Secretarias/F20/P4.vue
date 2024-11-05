<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <!-- Datos principales -->
                <AppDatos :active="true" :titulo="'DESIGNACIÓN DE TRIBUNAL REVISOR DE GRADO'"></AppDatos>

                <!-- Modalidad y Título -->
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

                <!-- Lista de Archivos -->
                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :mostrarObservacionesProp="true"
                    :nomArchivos="nomArchivos" :tabla="'designacion_tribunal'"
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
            </div>

            <div class="card">
                <!-- Tabla de Documentos -->
                <DocumentTable ref="docRef" :documentos="documentos"></DocumentTable><br>

                <!-- Botones de Acción -->
                <div v-if="!swdoc" class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning">
                        <i class="pi pi-arrow-left">&nbsp;Regresar</i>
                    </Button>
                </div>
                <div v-else class="flex justify-content-left flex-wrap gap-3">
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
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

// Componentes
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';
import DocumentTable from './Components/GenerarDocumentos.vue';

// Servicios
import workflowService from '@/services/workflow.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

const confirm = useConfirm();
const toast = useToast();

// Variables reactivas y referencias
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const listaArchivosKey = ref(0);
const docRef = ref(null);

const modalidad = ref()
const titulo = ref()
const tutor = ref()

const documentos = [
    { nombre: '1. Proyecto de Resolucion de Designacion de Tribunal de Grado', archivo: 'F18 D1 PROYECTO RESOLUCION TRIBUNAL DE GRADO.docx', value: 'proyecto_resolucion_tribunal', url: '' },
    { nombre: '2. Solicitud de aprobacion de Proyecto de Resolucion', archivo: 'F18 D2 SOLICITUD APROBACION TRIBUNAL DE GRADO.docx', value: 'solicitud_tribunal', url: '' }
]

const nomArchivos = ref(['1. Nota de suficiencia del tutor', '2. Trabajo de Grado']);
const valueArchivos = ref(["nota_suficiencia_tutor", "trabajo_grado"]);

// Hook onMounted para obtener los datos iniciales
onMounted(async () => {
    try {
        const { data } = await designacionTribunalService.obtenerDesignacionTribunal({ 'nrotramite': datosrecividos.nrotramite });
        modalidad.value = data.aprobacion_Perfil.modalidad;
        titulo.value = data.aprobacion_Perfil.titulo;
        tutor.value = data.aprobacion_Perfil.tutor;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Observador para cambios en la modalidad
watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('3. Carta de conclusion de la Institucion o empresa');
        valueArchivos.value.push('carta_conclusion_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

// Función para enviar el trámite
async function enviarTramite() {
    confirm.require({
        message: 'Está seguro de enviar estos datos',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                const a = datosrecividos.nrotramite;
                const b = datosrecividos.flujo;
                const c = datosrecividos.proceso;
                const env = { flujo: b, proceso: c, tramiteId: a, comentario: '', condicion: '' };

                const response = await workflowService.siguienteproceso(env);
                if (response) {
                    await generarHojaDeRuta(a);
                }
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
            }
        }
    });
}

// Función para generar la hoja de ruta
async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: '' };

    loadingModal.value = true;
    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/tramite-pendiente");
    } catch (error) {
        alert('Error al generar la hoja de ruta', error);
        redireccionar("/tramite-pendiente");
    } finally {
        loadingModal.value = false;
    }
}

// Función para redireccionar
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Estilos personalizados aquí */
</style>
