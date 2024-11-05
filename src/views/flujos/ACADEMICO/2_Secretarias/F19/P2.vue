<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
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

                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
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
import editDocumentService from '@/services/editDocument.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

// Referencias y Estados
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
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
const valueArchivos = ref(["nota_director", "nota_tutor", "conclusion_estudios", "record_academico", "perfil_grado"]);

// Hook onMounted
onMounted(async () => {
    try {
        const {data} = await aprobacionPerfilService.obtenerAprobacionPerfil({ 'nrotramite': datosrecividos.nrotramite });
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
async function enviarTramite() {
    confirm.require({
        message: 'Está seguro de enviar estos datos',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                await procesarEnvio();
                redireccionar("/tramite-pendiente");
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
            }
        }
    });
}

async function procesarEnvio() {
    const a = datosrecividos.nrotramite;
    const b = datosrecividos.flujo;
    const c = datosrecividos.proceso;
    const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': '', 'condicion': '' };

    const response = await workflowService.siguienteproceso(env);
    if (response) {
        await generarHojaDeRuta(a);
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

// Funciones auxiliares
function redireccionar(url) {
    router.replace(url);
}

</script>

<style scoped>
/* Puedes agregar tus estilos aquí */
</style>
