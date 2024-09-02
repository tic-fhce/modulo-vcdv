<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

                <ListaArchivos :key="listaArchivosKey" ref="valRef" :valueArchivos="valueArchivos"
                    :nomArchivos="nomArchivos" :mostrarObservacionesProp="true" :mostrarRevision="true"
                    :tabla="'aprobacion_perfil'" :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
                <br><br>
                <div>
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
import { ref, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import editDocumentService from '@/services/editDocument.service';

// Referencias y Estados
const router = useRouter();
const store = useStore();
const loadingModal = ref(false);
const datosrecividos = store.getters.getData;
const swdoc = !datosrecividos.fechafin;
const comentario = ref('');
const cond = ref('si');
const valRef = ref(null);
const modalidad = ref();
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

// Hook onMounted
onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'modalidad' };
    try {
        const response = await aprobacionPerfilService.obtenerColumna(dat);
        modalidad.value = response.data;
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

// Función para enviar trámite
async function enviarTramite() {
    if (valRef.value.validarRadioButtons()) {
        const confirmed = confirm('¿Está seguro de enviar estos datos?');
        if (confirmed) {
            const result = await valRef.value.todosDocumentosCorrectos();
            if (!result) {
                cond.value = 'no';
                comentario.value = 'observado';
            }
            await procesarEnvio();
        }
    }
}

// Función para procesar envío
async function procesarEnvio() {
    const tb = valRef.value.tabla;
    const nt = datosrecividos.nrotramite;

    const enviarSolicitud = async (index) => {
        if (index < tb.length) {
            await actualizarDocumento(index, tb[index], nt);
            await enviarSolicitud(index + 1);
        } else {
            await avanzarProceso(nt);
        }
    };

    await enviarSolicitud(0);
}

// Función para actualizar documentos
async function actualizarDocumento(index, doc, nroTramite) {
    const corr = doc.correcto.value;
    const obs = corr === 'correcto' ? corr : doc.errores.value;
    const dat = {
        columna: valueArchivos.value[index],
        observacion: obs,
        nrotramite: nroTramite,
        tabla: 'aprobacion_perfil'
    };
    await documentService.actualizarobservacionDocumentos(dat);
}

// Función para avanzar proceso y editar documento
async function avanzarProceso(nroTramite) {
    const b = datosrecividos.flujo;
    const c = datosrecividos.proceso;
    const env = {
        'flujo': b,
        'proceso': c,
        'tramiteId': nroTramite,
        'comentario': comentario.value,
        'condicion': cond.value
    };
    try {
        const response = await workflowService.siguienteproceso(env);
        if (response) {
            await generarHojaDeRuta(nroTramite);
        }
    } catch (error) {
        alert(error);
    }
}

// Función para editar documento
async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const obs = comentario.value
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: ' -  ' + obs };

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

// Función auxiliar para redireccionar
function redireccionar(url) {
    router.replace(url);
}
</script>

<style scoped>
/* Puedes agregar tus estilos aquí */
</style>
