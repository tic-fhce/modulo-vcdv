<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'DESIGNACION DE DOCENTES INTERINOS'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                     :mostrarObservacionesProp="true" :mostrarRevision="true" :mostrarDocente="true" :tabla="'designacion_doc_interinos'"/>
                <br><br>
                <div>
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
            <!-- {{ datosrecividos }} -->
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

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const nomArchivos = ref(['1. Proyecto de Resolucion']);
const valueArchivos = ref(["proy_resolucion"]);

async function enviarTramite() {
    if (valRef.value.validarRadioButtons()) {
        const confirmed = confirm('¿Esta seguro de enviar estos datos?');
        if (confirmed) {
            const result = await valRef.value.todosDocumentosCorrectos();
            //console.log(result)
            if (!result) {
                cond.value = 'no'
                comentario.value = 'observado'
            }
            const tb = valRef.value.tabla;
            const nt = datosrecividos.nrotramite;
            const enviarSolicitud = async (index) => {
                if (index < tb.length) {
                    const e = tb[index];
                    const corr = e.correcto.value;
                    const err = e.errores.value;
                    let obs;

                    if (corr === 'correcto') {
                        obs = corr;
                    } else {
                        obs = err;
                    }
                    const dat = { columna: valueArchivos.value[index], observacion: obs, nrotramite: nt, tabla: 'alumno_libre' };
                    await documentService.actualizarobservacionDocumentos(dat);

                    await enviarSolicitud(index + 1);
                } else {
                    const b = datosrecividos.flujo
                    const c = datosrecividos.proceso
                    try {
                        const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': comentario.value, 'condicion': cond.value }
                        await workflowService.siguienteproceso(env)
                    } catch (error) {
                        alert(error);
                    }
                    redireccionar("/tramite-pendiente")

                }
            };
            await enviarSolicitud(0);
        } else {
            // El usuario canceló
        }
    }
}

function redireccionar(url) {
    router.replace(url)
}
</script>