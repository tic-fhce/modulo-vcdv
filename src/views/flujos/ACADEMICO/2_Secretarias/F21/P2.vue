<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <AppDatos :active="true" :titulo="'CAMBIO DE MODALIDAD, TÍTULO o TUTOR DE GRADO'"></AppDatos>

                <div class="card">
                    <h5 style="text-decoration: underline;">DATOS DEL NUEVO PERFIL DE GRADO</h5>
                    <div class="mt-3 space-y-2">
                        <div class="field">
                            <span class="mr-1 font-bold">Cambio de:</span>
                            <span style="color: red; font-weight: bold;">{{ cambio }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1 font-bold">Modalidad de Graduación:</span>
                            <span style="color: blue; font-weight: bold;">{{ n_modalidad }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1 font-bold">Título del Trabajo de Grado:</span>
                            <span style="color: blue; font-weight: bold;">{{ n_titulo }}</span>
                        </div>
                        <div class="field">
                            <span class="mr-1 font-bold">Tutor del Trabajo de Grado:</span>
                            <span style="color: blue; font-weight: bold;">{{ n_tutor }}</span>
                        </div>
                    </div>
                </div>
                <br />
                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"
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
import { ref, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import editDocumentService from '@/services/editDocument.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();
const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const cambio = ref()
const n_modalidad = ref()
const n_titulo = ref()
const n_tutor = ref()

// Documentos requeridos y sus nombres internos
const nomArchivos = ref([
    '1. Nota dirigida al Director',
    '2. Nota de aceptación del tutor',
    '3. Perfil de grado'
]);
const valueArchivos = ref([
    "nota_director",
    "nota_tutor",
    "perfil_grado"
]);

// Documentos específicos para "Tutor"
const documentosTutor = [
    '1. Nota de renuncia del tutor',
    '2. Nota de aceptación del tutor'
];
const nomArchivosBaseTutor = [
    "nota_renuncia_tutor",
    "nota_aceptacion_tutor"
];

// Documentos específicos para "Titulo"
const documentosTitulo = [
    '4. Documento de validación del nuevo título'
];
const nomArchivosBaseTitulo = [
    'documento_validacion_titulo'
];

// Documentos específicos para "Modalidad" (si no es 'Tesis')
const documentosModalidadExtra = [
    '4. Carta de aceptación de propuesta por la Institución o empresa'
];
const nomArchivosBaseModalidadExtra = [
    'carta_institucion'
];

// Al montar el componente, obtener los datos del perfil anterior
onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite };
    try {
        const resp = await aprobacionPerfilService.obtenerAprobacionPerfil(dat);
        cambio.value = resp.data.cambio_resolucion;
        modalidad.value = resp.data.modalidad;
        titulo.value = resp.data.titulo;
        tutor.value = resp.data.tutor;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron obtener los datos del perfil anterior.',
            life: 3000
        });
    }
});

// Watcher para observar cambios en 'cambio' y actualizar 'nomArchivos' y 'valueArchivos'
watch(cambio, (newCambio) => {
    // Resetear 'nomArchivos' y 'valueArchivos' a los documentos base
    nomArchivos.value = [
        '1. Nota dirigida al Director',
        '2. Nota de aceptación del tutor',
        '3. Perfil de grado'
    ];
    valueArchivos.value = [
        "nota_director",
        "nota_tutor",
        "perfil_grado"
    ];

    switch (newCambio) {
        case 'Modalidad':
            if (modalidad.value !== 'Tesis') {
                nomArchivos.value.push(...documentosModalidadExtra);
                valueArchivos.value.push(...nomArchivosBaseModalidadExtra);
            }
            break;
        case 'Titulo':
            nomArchivos.value.push(...documentosTitulo);
            valueArchivos.value.push(...nomArchivosBaseTitulo);
            break;
        case 'Tutor':
            nomArchivos.value = [...documentosTutor];
            valueArchivos.value = [...nomArchivosBaseTutor];
            break;
        default:
            toast.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Tipo de cambio no reconocido.',
                life: 3000
            });
    }

    // Actualizar 'listaArchivosKey' para forzar la reactividad del componente 'ListaArchivos'
    listaArchivosKey.value += 1;
}, { immediate: true });

async function enviarTramite() {
    confirm.require({
        message: 'Está seguro de enviar estos datos',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                const a = datosrecividos.nrotramite
                const b = datosrecividos.flujo
                const c = datosrecividos.proceso

                try {
                    const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': '', 'condicion': '' }

                    const response = await workflowService.siguienteproceso(env);
                    if (response) {
                        await generarHojaDeRuta(a);
                    }

                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                }
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
            }
        }
    });
}
function redireccionar(url) {
    router.replace(url)
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


</script>

<style></style>