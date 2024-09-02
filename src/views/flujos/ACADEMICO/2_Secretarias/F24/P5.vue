<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div class="col-12 mb-2 lg:col-11 lg:mb-0">
            <div class="card">

                <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

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

                <ListaArchivos :valueArchivos="valueArchivos1" :nomArchivos="nomArchivos1"
                    :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DE APROBACION DE PERFIL'" />

                <br><br>

                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos"
                    :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"
                    :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />

                <div class="checkbox-container">
                    <input type="checkbox" v-model="aprobadoPorCAF" class="large-checkbox" />
                    <span class="checkbox-label">Aprobado por Vicedecanato</span>
                </div>

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

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const titulo = ref()
const listaArchivosKey = ref(0);
const aprobadoPorCAF = ref(false);

const nomArchivos = ref(['1. Nota dirigida al Director', '2. Nota de aceptacion del tutor', '3. Fotocopia simple de conclusion de estudios', '4. Record academico', '5. Perfil de grado']);
const valueArchivos = ref(["nota_director", "nota_tutor", "conclusion_estudios", "record_academico", "perfil_grado"]);

const nomArchivos1 = ref(['1. Proyecto de Resolucion de Perfil de Grado', '2. Solicitud de aprobacion de Proyecto de Resolucion']);
const valueArchivos1 = ref(["proyecto_resolucion_perfil", "solicitud_aprobacion_perfil"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'modalidad' };
    const dat1 = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'titulo' };
    try {
        const response = await aprobacionPerfilService.obtenerColumna(dat);
        const response1 = await aprobacionPerfilService.obtenerColumna(dat1);

        modalidad.value = response.data;
        titulo.value = response1.data;
    } catch (error) {
        console.error('Error al obtener la modalidad:', error);
    }
});

watch(modalidad, (newModalidad) => {
    if (newModalidad && newModalidad !== 'Tesis') {
        nomArchivos.value.push('6. Aceptacion formal de la propuesta por la Institucion o empresa');
        valueArchivos.value.push('carta_institucion');
        listaArchivosKey.value += 1;
    }
}, { immediate: true });

async function enviarTramite() {
    if (!aprobadoPorCAF.value) {
        alert('Marcar la opción de aprobación');
        return;
    }

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

function redireccionar(url) {
    router.replace(url)
}
</script>