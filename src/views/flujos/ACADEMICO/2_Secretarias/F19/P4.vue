<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <AppDatos :active="true" :titulo="'DESIGNACION DE TRIBUNAL REVISOR DE GRADO'"></AppDatos>

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

                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :mostrarObservacionesProp="true"
                    :nomArchivos="nomArchivos" :tabla="'designacion_tribunal'" :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
                
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
                    <Button @click="enviarTramite()"><i
                            class="pi pi-arrow-right text">Enviar&nbsp;</i></Button>
                </div>
            </div>
        </div>
    </div>
    <!-- <button @click="showChildData">Show Child Data</button> -->
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
import DocumentTable from './Components/GenerarDocumentos.vue';
import designacionTribunalService from '@/services/designacionTribunal.service';

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const titulo = ref()
const listaArchivosKey = ref(0);
const uploadDone = ref(false);
const docRef = ref(null)

const documentos = [
    { nombre: '1. Proyecto de Resolucion de Designacion de Tribunal de Grado', archivo: 'F19 D1 PROYECTO RESOLUCION TRIBUNAL DE GRADO.docx', value: 'proyecto_resolucion_tribunal', url: ''},
    { nombre: '2. Solicitud de aprobacion de Proyecto de Resolucion', archivo: 'F19 D2 SOLICITUD APROBACION TRIBUNAL DE GRADO.docx', value:'solicitud_tribunal', url:'' }
]

const nomArchivos = ref(['1. Nota de suficiencia del tutor', '2. Trabajo de Grado']);
const valueArchivos = ref(["nota_suficiencia_tutor", "trabajo_grado"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'aprobacion_perfil_id' };
    try {
        const idP = await designacionTribunalService.obtenerColumna(dat);
        const { data } = await designacionTribunalService.obtenerPerfilGradoId({ idPerfil: idP.data})

        titulo.value = data[0].titulo
        modalidad.value = data[0].modalidad
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('3. Carta de conclusion de la Institucion o empresa');
        valueArchivos.value.push('carta_conclusion_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

async function enviarTramite() {
    const confirmed = confirm('¿Esta seguro de enviar estos datos?');
    if (confirmed) {
        const a = datosrecividos.nrotramite
        const b = datosrecividos.flujo
        const c = datosrecividos.proceso

        try {
            const env = { 'flujo': b, 'proceso': c, 'tramiteId': a, 'comentario': '', 'condicion': '' }

            await workflowService.siguienteproceso(env)

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
</script>