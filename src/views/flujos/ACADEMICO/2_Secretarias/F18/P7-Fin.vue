<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'APROBACION DE PERFIL DE GRADO'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'aprobacion_perfil'"/>
                <br><br>
                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    presione en enviar y inicie el tramite para solicitar la designación de su tribunal revisor de grado.
                </h6>
                <br>
                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
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
import { createApp, ref, computed, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import aprobacionPerfilService from '@/services/aprobacionPerfil.service';

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const modalidad = ref()

const nomArchivos = ref(['1. Resolucion de perfil de grado']);
const valueArchivos = ref(["resolucion_perfil"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'modalidad' };
    try {
        modalidad.value = await aprobacionPerfilService.obtenerColumna(dat);
        if (modalidad.value.data != 'Tesis') {
            nomArchivos.value.push('6. Carta de aceptacion de propuesta por la Institucion o empresa')
            valueArchivos.value.push('carta_institucion')
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

            await workflowService.siguienteproceso(env)

        } catch (error) {
            alert(error);
        }

        router.push("/tramite-pendiente");
    } else {
        // El usuario canceló
    }

}

function redireccionar(url) {
    router.replace(url)
}
</script>