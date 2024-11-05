<template>
    <Toast />
    <ConfirmDialog />
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'SOLICITUD DE CONVALIDACION DE MATERIAS DE PLAN A PLAN'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :mostrarObservacionesProp="true" :mostrarRevision="true" :tabla="'convalidacion_01'" />
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
            <span class="ml-3">Enviando, espere porfavor...</span>
        </div>
    </Dialog>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { createApp, ref, computed, onMounted } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import AppDatos from './Components/Datos.vue'
import ListaArchivos from './Components/ListaArchivos.vue'
import workflowService from '@/services/workflow.service';
import documentService from '@/services/document.service';
import editDocumentService from '@/services/editDocument.service';

const confirm = useConfirm();
const toast = useToast();

const loadingModal = ref(false);
const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const com = ref('')

const valRef = ref(null)

const valueArchivos = ["nota_director", "cedula_identidad", "record_academico"];
const nomArchivos = ["1. Nota dirigida al Director", "2. Cedula de Identidad", "3. Record Academico"];

async function enviarTramite() {
    if (valRef.value.validarRadioButtons()) {
        confirm.require({
            message: 'Está seguro de enviar estos datos',
            header: 'Confirmación',
            icon: 'pi pi-question-circle',
            accept: async () => {
                try {
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

                            const dat = { columna: valueArchivos[index], observacion: obs, nrotramite: nt, tabla: 'convalidacion_01' };
                            await documentService.actualizarobservacionDocumentos(dat);

                            await enviarSolicitud(index + 1);
                        } else {
                            const b = datosrecividos.flujo
                            const c = datosrecividos.proceso
                            try {
                                const env = { 'flujo': b, 'proceso': c, 'tramiteId': nt, 'comentario': com.value, 'condicion': cond }
                                const response = await workflowService.siguienteproceso(env);
                                if (response) {
                                    await generarHojaDeRuta();
                                }
                            } catch (error) {
                                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al enviar los datos', life: 3000 });
                            }

                            if (result) {
                                cambiarData()
                                window.location.replace("/F3/P4")
                            } else {
                                redireccionar("/tramite-pendiente")
                            }


                        }
                    };
                    await enviarSolicitud(0);
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos.', life: 3000 });
                }
            }
        });
    }
}

function redireccionar(url) {
    router.replace(url)
}

async function generarHojaDeRuta() {
    const nt = datosrecividos.nrotramite;
    const r = datosrecividos.rol;
    const f = datosrecividos.formulario;
    const obs = com.value;
    const datosFormateados = { nrotramite: nt, rol: r, ref: f, obs: '  - ' + obs };

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

function cambiarData() {
    let data = localStorage.getItem('data');
    if (data) {
        data = JSON.parse(data);
        data.estado = 'pendiente';
        data.proceso = 'P4';
        data.observaciones = '';
        const updatedData = JSON.stringify(data);
        localStorage.setItem('data', updatedData);
    } else {
        console.log('No se encontró el objeto en localStorage.');
    }
}
</script>