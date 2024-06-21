<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CONVALIDACION DE MATERIAS DE OTRAS CARRERAS'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarObservacionesProp="true" :mostrarRevision="true" :tabla="'convalidacion_02'" />
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
const com = ref('')

const valRef = ref(null)

const valueArchivos = ["informe_convalidacion", "proy_resolucion"];
const nomArchivos = ["1. Informe de Convalidacion", "2. Proyecto de Resolucion"];

async function enviarTramite() {
    if (valRef.value.validarRadioButtons()) {
        const confirmed = confirm('¿Esta seguro de enviar estos datos?');
        if (confirmed) {
            const result = await valRef.value.todosDocumentosCorrectos();
            let cond;
            if (result) {
                cond = "si"
            }
            else {
                com.value = "observado"
                cond = "no"
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

                    const dat = { columna: valueArchivos[index], observacion: obs, nrotramite: nt, tabla: 'convalidacion_02' };
                    await documentService.actualizarobservacionDocumentos(dat);

                    await enviarSolicitud(index + 1);
                } else {
                    const b = datosrecividos.flujo
                    const c = datosrecividos.proceso
                    try {
                        const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': com.value, 'condicion': cond }
                        await workflowService.siguienteproceso(env)
                    } catch (error) {
                        alert(error);
                    }

                    redireccionar("/tramite-concluido")
                    
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