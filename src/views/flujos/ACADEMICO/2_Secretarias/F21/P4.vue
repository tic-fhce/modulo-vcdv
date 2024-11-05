<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <AppDatos :active="true" :titulo="'CAMBIO DE MODALIDAD, TITULO o TUTOR DE GRADO'"></AppDatos>

                <!-- Modalidad y Título -->
                <div class="mt-3 space-y-2">
                    <div class="field">
                        <span class="mr-1 font-bold">Modalidad de Graduacion Actual:</span>
                        <span style="color: blue; font-weight: bold;">{{ modalidadActualSeleccionada }}</span>
                    </div>
                    <div class="field">
                        <span class="mr-1 font-bold">Titulo Actual del Trabajo de Grado:</span>
                        <span style="color: blue; font-weight: bold;">{{ tituloActual }}</span>
                    </div>
                </div>
                <br />
            </div>

            <div class="card">
                <h5 style="color: red; text-align: center;">SOLICITUD DE CAMBIO</h5><br>

                <div class="mt-3 space-y-2">
                    <div class="field">
                        <span class="mr-1 font-bold">Cambio de:</span>
                        <span style="color: blue; font-weight: bold;">{{ cambio }} </span>
                    </div>
                    <div class="field" v-if="cambio == 'Modalidad'">
                        <span class="mr-1 font-bold">Modalidad de Graduacion:</span>
                        <span style="color: blue; font-weight: bold;">{{ n_modalidad }}</span>
                    </div>
                    <div class="field" v-if="cambio == 'Modalidad' || cambio == 'Titulo'">
                        <span class="mr-1 font-bold">Titulo del Trabajo de Grado:</span>
                        <span style="color: blue; font-weight: bold;">{{ n_titulo }}</span>
                    </div>
                </div>
                <br />

                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :mostrarObservacionesProp="true"
                    :nomArchivos="nomArchivos" :tabla="'cambio_modalidad'" :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />

            </div>

            <div class="card">

                <DocumentTable ref="docRef" :documentos="documentos"></DocumentTable><br>

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
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';
import DocumentTable from './Components/GenerarDocumentos.vue';

import cambioModalidadService from '@/services/cambioModalidad.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const titulo = ref()
const listaArchivosKey = ref(0);
const uploadDone = ref(false);
const docRef = ref(null)

const documentos = [
    { nombre: '1. Proyecto de Resolucion de Perfil de Grado', archivo: 'F19 D1 PROYECTO RESOLUCION CAMBIO.docx', value: 'proyecto_resolucion_perfil', url: '' },
    { nombre: '2. Solicitud de aprobacion de Proyecto de Resolucion', archivo: 'F19 D2 SOLICITUD CAMBIO.docx', value: 'solicitud_aprobacion_perfil', url: '' }
]

const tituloActual = ref('');
const modalidadActualSeleccionada = ref();

const cambio = ref()
const n_modalidad = ref()
const n_titulo = ref()
const n_tutor = ref()

const nomArchivos = ref(['1. Nota dirigida al Director', '2. Nota de aceptacion del tutor', '3. Perfil de grado']);
const valueArchivos = ref(["nota_director", "nota_tutor", "perfil_grado"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite };
    try {
        const resp = await cambioModalidadService.obtenerFila(dat);
        cambio.value = resp.data.cambio
        n_modalidad.value = resp.data.n_modalidad
        n_titulo.value = resp.data.n_titulo
        n_tutor.value = resp.data.n_tutor

        const { data } = await designacionTribunalService.obtenerPerfilGradoId({ idPerfil: resp.data.aprobacion_perfil_id });
        modalidadActualSeleccionada.value = data[0].modalidad;
        tituloActual.value = data[0].titulo;

        if (cambio.value == 'Modalidad') {
            if (n_modalidad.value != 'Tesis') {
                nomArchivos.value.push('4. Carta de aceptacion de propuesta por la Institucion o empresa')
                valueArchivos.value.push('carta_institucion')
            }
        }

    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

async function enviarTramite() {
    const confirmed = confirm('¿Esta seguro de enviar estos datos?');
    if (confirmed) {
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
            alert(error);
        }

        router.push("/tramite-concluido");
    } else {
        // El usuario canceló
    }

}
// function showChildData() {
//   console.log(docRef.value.uploadDone); // Accede a la propiedad expuesta del hijo
// }
function redireccionar(url) {
    router.replace(url)
}

async function generarHojaDeRuta(nroTramite) {
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const datosFormateados = { nrotramite: nroTramite, rol: r, ref: f, obs: ''};

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