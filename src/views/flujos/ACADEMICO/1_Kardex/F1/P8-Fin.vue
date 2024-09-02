<template>
    <AppTopbar></AppTopbar>
    <br>
    <div class="layout-main-container">
        <div style="width: 80%;">
            <div class="card">

                <AppDatos :active="true" :titulo="'INSCRIPCION DE ASIGNATURAS DE ALUMNOS LIBRES'"></AppDatos>

                <ListaArchivos ref="valRef" :valueArchivos="valueArchivos" :nomArchivos="nomArchivos" :tabla="'alumno_libre'"/>
                <br><br>
                <h6 :style="{ color: 'blue', textTransform: 'uppercase' }">
                    Descargue su resolucion
                </h6>
                <br>
                <div class="flex justify-content-left flex-wrap gap-3">
                    <Button @click="redireccionar('/tramite-concluido')" severity="warning"><i
                            class="pi pi-arrow-left">&nbsp;Regresar</i></Button>
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

const router = useRouter()
const store = useStore()
const datosrecividos = store.getters.getData

const valRef = ref(null)


const nomArchivos = ref(['1. Resolucion de Alumno Libre']);
const valueArchivos = ref(["resolucion"]);

function redireccionar(url) {
    router.replace(url)
}
</script>