<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <!-- Título del Componente -->
                <AppDatos :active="true" :titulo="'DESIGNACION DE TRIBUNAL REVISOR DE GRADO'"></AppDatos>

                <!-- Información General -->
                <div class="mt-3 space-y-2">
                    <div class="field">
                        <span class="mr-1 font-bold">Modalidad de Graduacion:</span>
                        <span style="color: blue; font-weight: bold;">{{ modalidad }}</span>
                    </div>
                    <div class="field">
                        <span class="mr-1 font-bold">Titulo del Trabajo de Grado:</span>
                        <span style="color: blue; font-weight: bold;">{{ titulo }}</span>
                    </div>
                </div>
                <br>

                <!-- Lista de Archivos -->
                <ListaArchivos 
                    :valueArchivos="valueArchivos" 
                    :nomArchivos="nomArchivos" 
                    :tabla="'designacion_tribunal'" 
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" 
                />
                <br><br>

                <!-- Botones de Navegación -->
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
import { ref, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';
import workflowService from '@/services/workflow.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

// Variables y Referencias
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const modalidad = ref();
const titulo = ref();

// Archivos y Nombres de Archivos
const nomArchivos = ref([
    '1. Nota de suficiencia del tutor', 
    '2. Trabajo de Grado'
]);
const valueArchivos = ref([
    "nota_suficiencia_tutor", 
    "trabajo_grado"
]);

// Hook para obtener datos cuando el componente se monta
onMounted(async () => {
    try {
        const dat = { nrotramite: datosrecividos.nrotramite, columna: 'aprobacion_perfil_id' };
        const idP = await designacionTribunalService.obtenerColumna(dat);
        const { data } = await designacionTribunalService.obtenerPerfilGradoId({ idPerfil: idP.data });

        titulo.value = data[0].titulo;
        modalidad.value = data[0].modalidad;

        // Agregar documento extra si la modalidad no es 'Tesis'
        if (modalidad.value.data !== 'Tesis') {
            nomArchivos.value.push('3. Carta de conclusion de la Institucion o empresa');
            valueArchivos.value.push('carta_conclusion_institucion');
        }
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

// Función para enviar el trámite
async function enviarTramite() {
    const confirmed = confirm('¿Está seguro de enviar estos datos?');
    if (confirmed) {
        try {
            await procesarTramite();
        } catch (error) {
            alert(error);
        }
    }
}

// Función para procesar el trámite
async function procesarTramite() {
    const { nrotramite, flujo, proceso } = datosrecividos;

    const env = { 
        flujo, 
        proceso, 
        tramiteId: nrotramite, 
        comentario: '', 
        condicion: '' 
    };

    const response = await workflowService.siguienteproceso(env);
    if (response) {
        await generarHojaDeRuta(nrotramite);
    }
}

// Función para generar la Hoja de Ruta
async function generarHojaDeRuta(nroTramite) {
    const { rol, formulario } = datosrecividos;
    const datosFormateados = { nrotramite: nroTramite, rol, ref: formulario, obs: '' };

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

// Función para redireccionar a una URL
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Puedes agregar tus estilos aquí */
</style>
