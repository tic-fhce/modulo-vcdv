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

                <ListaArchivos :key="listaArchivosKey" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos"
                    :tabla="'designacion_tribunal'" :nomDivision="'DOCUMENTOS DE APROBACION DE TRIBUNAL'" />

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

        <Button @click="listarToken()">Listar</Button>
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
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import designacionTribunalService from '@/services/designacionTribunal.service';
import editDocumentService from '@/services/editDocument.service';
import tokenService from '@/services/token.service';
import workflowService from '@/services/workflow.service';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppDatos from './Components/Datos.vue';
import DocumentTable from './Components/GenerarDocumentos.vue';
import ListaArchivos from './Components/ListaArchivos.vue';

const router = useRouter()
const store = useStore()
const loadingModal = ref(false);
const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin
const modalidad = ref()
const titulo = ref()
const listaArchivosKey = ref(0);
const docRef = ref(null)

const documentos = [
    { nombre: '1. Resolucion de Tribunal de Grado', archivo: 'F18 D3 RESOLUCION TRIBUNAL DE GRADO.docx', value: 'resolucion_tribunal', url: '' }
]

const nomArchivos = ref(['1. Proyecto de Resolucion de Designacion de Tribunal de Grado', '2. Solicitud de aprobacion de Proyecto de Resolucion']);
const valueArchivos = ref(["proyecto_resolucion_tribunal", "solicitud_tribunal"]);

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

function redireccionar(url) {
    router.replace(url)
}

// Función para generar la Hoja de Ruta
async function generarHojaDeRuta(nroTramite) {
    const { rol, formulario } = datosrecividos;
    const datosFormateados = { nrotramite: nroTramite, rol, ref: formulario, obs: '' };

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

async function listarToken(){
    try{
        const {data} = await tokenService.ListarToken()
        const pin = "12988790"
        if(data.datos.connected){
            const tokens = data.datos.tokens
            const slots = []
            const serials = []
            const names = []
            const models = []
            for(let i = 0; i < tokens.length; i++){
                slots.push(tokens[i].slot)
                serials.push(tokens[i].serial)
                names.push(tokens[i].name)
                models.push(tokens[i].model)
            }

            const datos_cert = {"pin": pin, "slot": slots[0]}
            const certificados = await tokenService.ListarCertificados(datos_cert)
            const alias = certificados.data.datos.data_token.data[0].alias

            console.log(alias)

            /*console.log(slots)
            console.log(serials)
            console.log(names)
            console.log(models)*/
        }
    } catch(error) {
        alert('Servicio de Firma no disponible')
    }
}
</script>