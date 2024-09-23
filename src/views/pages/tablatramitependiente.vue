<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">TRAMITES PENDIENTES</h4>
        <DataTable v-model:filters="filters" :value="tramitependiente" paginator :rows="10" dataKey="id"
            filterDisplay="row" :loading="loading"
            :globalFilterFields="['nrotramite', 'flujo', 'proceso', 'observaciones', 'fechainicio', 'tiempo', 'estado', 'accion']">
            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>

            <template #empty> No se encontraron tramites. </template>
            <template #loading> Cargando tramites. Espere por favor. </template>

            <Column field="nrotramite" header="Nro. Tramite" :sortable="true" style="width: 10%">
                <template #body="{ data }">
                    {{ data.nrotramite }}
                </template>
            </Column>
            <Column field="formulario" header="Proceso" :sortable="true" style="width: 20%">
                <template #body="{ data }">
                    {{ data.formulario }}
                </template>
            </Column>
            <Column field="observaciones" header="Observaciones" :sortable="true" style="width: 20%">
                <template #body="{ data }">
                    <Tag :value="data.observaciones" :severity="getSeverity('observado')" />
                </template>
            </Column>
            <Column field="fechainicio" header="Fecha de Inicio" :sortable="true" style="width: 15%">
                <template #body="{ data }">
                    {{ data.fechainicio }}
                </template>
            </Column>
            <Column field="tiempo" header="Tiempo Restante" :sortable="true" style="width: 15%">
                <template #body="{ data }">
                    {{ data.tiempo }}
                </template>
            </Column>
            <Column field="estado" header="Estado" :sortable="true" :showFilterMenu="false"
                :filterMenuStyle="{ width: '14rem' }" style="width: 10%">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeverity(data.estado)" />
                </template>
            </Column>
            <Column field="accion" header="Acciones" style="width:10%">
                <template #body="{ data }">
                    <Button @click="VerFormulario(data)" label="Info" severity="info" raised><i
                            class="pi pi-arrow-right"></i></Button>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { TramitePendienteService } from './tramitependiente.js';
import { useRouter } from 'vue-router';
import seguimientoService from '@/services/seguimiento.service';

const router = useRouter();
const store = useStore();

const tramitependiente = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

});

const loading = ref(true);

let interval;
onMounted(() => {
    fetchTramites();
    interval = setInterval(fetchTramites, 1000 * 60);
});

onBeforeUnmount(() => {
    clearInterval(interval);
});


async function fetchTramites() {
    try {
        const data = await TramitePendienteService.getData();
        tramitependiente.value = data;
        loading.value = false
    } catch (error) {
        console.error('Error al obtener los tramites:', error);
    }
}

const getSeverity = (status) => {
    switch (status) {
        case 'observado':
            return 'danger';

        case 'terminado':
            return 'success';

        case 'pendiente':
            return 'warning';

        case 'fuera de plazo':
            return 'danger';
    }
}

async function VerFormulario(data) {
    const F = data.flujo
    const P = data.proceso
    const T = data.nrotramite

    const env = { 'flujo': F, 'proceso': P, 'nroTramite': T }
    try {
        await seguimientoService.activarVisto(env);
    } catch (error) {
        console.error('Error al obtener los trámites pendientes:', error);
    }

    store.dispatch('setData', data);

    // localStorage.setItem('nrotramite', T)
    // localStorage.setItem('flujo', F)
    // localStorage.setItem('proceso', P)

    router.replace('/' + F + '/' + P)

}


</script>