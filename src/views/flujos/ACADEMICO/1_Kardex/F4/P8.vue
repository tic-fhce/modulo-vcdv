<template>
    <AppTopbar></AppTopbar>
    <Toast />
    <ConfirmDialog />
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CONVALIDACIÓN DE MATERIAS DE OTRAS CARRERAS'"></AppDatos>

                <ListaArchivos :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'convalidacion_02'"
                    :nom-division="'DOCUMENTOS DEL ESTUDIANTE'" :mostrarObservacionesProp="true" />
                <br><br>
                <ListaArchivos :valueArchivos="valueArchivos2" :nomArchivos="nomArchivos2" :tabla="'convalidacion_02'"
                    :mostrarVFirma="true" :nom-division="'DOCUMENTOS ADJUNTOS'" />
            </div>

            <div class="card">
                <GenerarDocument ref="docRef" :documentos="documentos"></GenerarDocument>
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
import { ref } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppDatos from './Components/Datos.vue';
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import GenerarDocument from './Components/GenerarDocumentos.vue';
import editDocumentService from '@/services/editDocument.service';
const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);
const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const urlDoc = ref()

const documentos = [
    { nombre: '1. Resolución de Convalidación', archivo: 'F4 D3 RESOLUCION.docx', value: 'resolucion', url: '' }
]

const valueArchivos = ["nota_director", "formulario_convalidacion", "cedula_identidad", "record_academico_carrera_origen", "contenidos_analiticos"];
const nomArchivos = ['1. Nota dirigida al Director', '2. Formulario de Convalidacion', '3. Cedula de Identidad', '4. Record Academico de la Carrera y Universidad que viene', '5. Contenidos Analiticos'];

const valueArchivos2 = ["informe_convalidacion", "proy_resolucion"];
const nomArchivos2 = ['1. Informe de convalidación', '2. Proyecto de Resolución'];

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
                        await generarHojaDeRuta();
                    }
                } catch (error) {
                    alert(error);
                }

                redireccionar("/tramite-pendiente");
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
            }
        }
    });
}

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