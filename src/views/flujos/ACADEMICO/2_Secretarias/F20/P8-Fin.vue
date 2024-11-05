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
                    :nomDivision="'DOCUMENTOS CARGADOS'" />
                <br><br>
                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'designacion_tribunal'"
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
import designacionTribunalService from '@/services/designacionTribunal.service';

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


const nomArchivos = ref(['1. Nota de suficiencia del tutor', '2. Trabajo de Grado']);
const valueArchivos = ref(["nota_suficiencia_tutor", "trabajo_grado"]);

const nomArchivos2 = ref(['3. Resolucion de Tribunal de Grado']);
const valueArchivos2 = ref(["resolucion_tribunal"]);

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

// Función para redireccionar
function redireccionar(url) {
    router.replace(url);
}
</script>
