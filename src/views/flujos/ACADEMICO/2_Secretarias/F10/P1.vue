<template>
    <AppTopbar></AppTopbar>
    <br>
    <!-- <AppMenu></AppMenu> -->
    <div class="layout-main-container">
        <div style="width: 90%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'DESIGNACION DE DOCENTES INTERINOS'"></AppDatos>

                <h5>DOCENTES APROBADOS</h5>
                <DataTable :value="orderlistValue" class="p-datatable-gridlines">
                    <Column field="docente" header="Docente"></Column>
                    <Column field="ci" header="C.I."></Column>
                    <Column field="celular" header="Celular"></Column>
                    <Column field="doc1" header="Documento 1"></Column>
                    <Column field="doc2" header="Documento 2"></Column>
                    <Column field="doc3" header="Documento 3"></Column>
                </DataTable>

                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    enviar a los docentes, para complementar los documentos faltantes
                </h6>

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
                <!-- <p @click="enviarMensaje">Haz clic aquí para enviar un mensaje de WhatsApp</p> -->
            </div>
        </div>
    </div>
    <AppFooter></AppFooter>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import AppMenu from '@/layout/bandeja/AppMenu.vue';
import AppDatos from './Components/Datos.vue';
import workflowService from '@/services/workflow.service';

const router = useRouter()
const store = useStore()

const datosrecividos = store.getters.getData
const swdoc = !datosrecividos.fechafin

const orderlistValue = ref([
    { docente: 'Docente 1', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
    { docente: 'Docente 2', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
    { docente: 'Docente 3', ci: 'DC', celular: 'Dato 1', doc1: 'Dato 2', doc2: 'Dato 3', doc3: '' },
]);


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

function redireccionar(url) {
    router.replace(url)
}

</script>

<style></style>