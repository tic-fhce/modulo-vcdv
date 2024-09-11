<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">
                <!-- Datos principales -->
                <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

                <!-- Modalidad y Título -->
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

                <!-- Lista de Archivos de Aprobación de Perfil -->
                <ListaArchivos :valueArchivos="valueArchivos1" :nomArchivos="nomArchivos1"
                    :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DE APROBACION DE PERFIL'" />

                <br><br>

                <!-- Lista de Archivos del Estudiante -->
                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos"
                    :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />

                <!-- Checkbox de Aprobación -->
                <div class="checkbox-container">
                    <Button @click="firmarDocumento()" severity="warning">
                        <i class="pi pi-pencil"> Firmar</i>
                    </Button>
                </div>

                <br><br>
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
            <span class="ml-3">Enviando, espere por favor...</span>
        </div>
    </Dialog>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';

// Componentes
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';

// Servicios
import workflowService from '@/services/workflow.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import editDocumentService from '@/services/editDocument.service';

// Variables reactivas y referencias
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const modalidad = ref();
const titulo = ref();
const listaArchivosKey = ref(0);

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

const nomArchivos1 = ref([
    '1. Proyecto de Resolucion de Perfil de Grado',
    '2. Solicitud de aprobacion de Proyecto de Resolucion'
]);
const valueArchivos1 = ref([
    "proyecto_resolucion_perfil",
    "solicitud_aprobacion_perfil"
]);

// Hook onMounted para obtener los datos iniciales
onMounted(async () => {
    try {
        const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'modalidad' };
        const dat1 = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'titulo' };
        const response = await aprobacionPerfilService.obtenerColumna(dat);
        const response1 = await aprobacionPerfilService.obtenerColumna(dat1);

        modalidad.value = response.data;
        titulo.value = response1.data;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Observador para cambios en la modalidad
watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('6. Aceptacion formal de la propuesta por la Institucion o empresa');
        valueArchivos.value.push('carta_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

// Función para enviar el trámite
async function enviarTramite() {
    const confirmed = confirm('¿Está seguro de enviar estos datos?');
    if (confirmed) {
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
            alert(error);
        }
    }
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

async function firmarDocumento() {
    
}

// Función para redireccionar
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Estilos personalizados aquí */
</style>
