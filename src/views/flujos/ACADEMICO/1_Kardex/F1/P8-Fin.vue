<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCION DE ASIGNATURAS DE ALUMNOS LIBRES'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'alumno_libre'"
                    :nomDivision="'DOCUMENTOS CARGADOS'" /><br><br>

                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'alumno_libre'"
                    :nomDivision="'RESOLUCIÓN'" :mostrar-v-firma="true" />
                <br><br>
                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    Descargue su resolucion
                </h6>
                <br>
                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
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
import { createApp, ref, computed, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import ListaArchivos from './Components/ListaArchivos.vue'
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()
const store = useStore()
const toast = useToast();
const confirm = useConfirm();

const loadingModal = ref(false);
const datosrecividos = store.getters.getData

const valRef = ref(null)

const nomArchivos = ref(['1. Nota de solicitud', '2. Respaldo']);
const valueArchivos = ref(["solicitud", "respaldo"]);

const nomArchivos2 = ref(['1. Resolucion de alumno libre']);
const valueArchivos2 = ref(["resolucion"]);

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