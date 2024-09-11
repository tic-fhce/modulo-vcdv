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

                <ListaArchivos :key="listaArchivosKey" ref="valRef" :valueArchivos="valueArchivos"
                    :nomArchivos="nomArchivos" :mostrarObservacionesProp="true" :mostrarRevision="true"
                    :tabla="'designacion_tribunal'" :nomDivision="'DOCUMENTOS DEL ESTUDIANTE'" />
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

    <!-- Modal de Carga -->
    <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false"
        header="Cargando datos">
        <div class="flex align-items-center justify-content-center">
            <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                animationDuration=".5s" />
            <span class="ml-3">Enviando, espere por favor...</span>
        </div>
    </Dialog>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { createApp, ref, computed, onMounted, watch } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue'
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const comentario = ref('')
const cond = ref('si')
const valRef = ref(null)

const modalidad = ref()
const titulo = ref()
const listaArchivosKey = ref(0);

const nomArchivos = ref(['1. Nota de suficiencia del tutor', '2. Trabajo de Grado']);
const valueArchivos = ref(["nota_suficiencia_tutor", "trabajo_grado"]);

onMounted(async () => {
    const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'aprobacion_perfil_id' };
    try {
        const idP = await designacionTribunalService.obtenerColumna(dat);
        const { data } = await designacionTribunalService.obtenerPerfilGradoId({ idPerfil: idP.data })

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
                    const dat = { columna: valueArchivos.value[index], observacion: obs, nrotramite: nt, tabla: 'designacion_tribunal' };
                    await documentService.actualizarobservacionDocumentos(dat);

                    await enviarSolicitud(index + 1);
                } else {
                    const b = datosrecividos.flujo
                    const c = datosrecividos.proceso
                    try {
                        const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': comentario.value, 'condicion': cond.value }
                        const response = await workflowService.siguienteproceso(env);
                        if (response) {
                            await generarHojaDeRuta(nt);
                        }
                    } catch (error) {
                        alert(error);
                    }
                }
            };
            await enviarSolicitud(0);
        } else {
            // El usuario canceló
        }
    }
}

// Función para generar la Hoja de Ruta
async function generarHojaDeRuta(nroTramite) {
    const { rol, formulario } = datosrecividos;
    const obs = comentario.value
    const datosFormateados = { nrotramite: nroTramite, rol, ref: formulario, obs: ' -  ' + obs };

    loadingModal.value = true;
    try {
        await editDocumentService.editarDocumento(datosFormateados);
        redireccionar("/tramite-pendiente");
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