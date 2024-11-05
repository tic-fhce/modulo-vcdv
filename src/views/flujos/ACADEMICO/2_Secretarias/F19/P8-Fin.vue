<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <!-- Datos principales -->
                <AppDatos :active="true" :titulo="'APROBACIÓN DE PERFIL DE GRADO'"></AppDatos>

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
                    :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
                <br><br>
                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'aprobacion_perfil'"
                    :nomDivision="'RESOLUCIÓN'" :mostrar-v-firma="true"/>
                <br><br>
                <!-- Botones de Acción -->
                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning">
                        <i class="pi pi-arrow-left">&nbsp;Regresar</i>
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

// Servicios
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';

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

const nomArchivos2 = ref(['1. Resolucion de Perfil de Grado']);
const valueArchivos2 = ref(["resolucion_perfil"]);

// Hook onMounted para obtener los datos iniciales
onMounted(async () => {
    try {
        const { data } = await aprobacionPerfilService.obtenerAprobacionPerfil({ 'nrotramite': datosrecividos.nrotramite });
        modalidad.value = data.modalidad;
        titulo.value = data.titulo;
        tutor.value = data.tutor;
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

// Función para redireccionar
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Estilos personalizados aquí */
</style>
