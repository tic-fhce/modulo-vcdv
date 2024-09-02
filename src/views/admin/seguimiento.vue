<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">LISTA DE SEGUIMIENTO DE TRAMITES</h4>
        <DataTable v-model:filters="filters" :value="Lista" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading"
                :globalFilterFields="['nrotramite', 'carrera', 'user', 'rol', 'formulario', 'observacion', 'fechaini', 'fechafin', 'tiempo', 'estado']">
            <template #header>
                <div class="flex justify-content-end">
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>
            <template #empty> No se encontraron tramites. </template>
            <template #loading> Cargando tramites. Espere por favor. </template>
            <Column field="nrotramite" header="Nro. Tramite" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.nrotramite }}
                </template>
            </Column>
            <Column field="carrera" header="Carrera" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.carrera }}
                </template>
            </Column>
            <Column field="user" header="Usuario" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.usuario }}
                </template>
            </Column>
            <Column field="rol" header="Rol" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.rol }}
                </template>
            </Column>
            <Column field="proceso" header="Proceso" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.formulario }}
                </template>
            </Column>
            <Column field="observaciones" header="Observaciones" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    <Tag :value="data.observacion" :severity="getSeverity('observado')" />
                </template>
            </Column>
            <Column field="fechaini" header="Fecha Inicio" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.fechaini }}
                </template>
            </Column>
            <Column field="fechafin" header="Fecha Fin" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.fechafin }}
                </template>
            </Column>
            <Column field="tiempo" header="Tiempo de Respuesta" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.tiempo }}
                </template>
            </Column>
            <Column field="estado" header="Estado" :sortable="true"  :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 10%">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeverity(data.estado)" />
                </template>
            </Column>
            <!-- <Column field="accion" header="Acciones" style="min-width:12.5%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="VerFormulario(data)" label="Info" severity="info" raised><i class="pi pi-arrow-right"></i></Button>
                        <Button @click="QuitarFormulario(data)" label="Info" severity="danger" raised class="p-button-danger"><i class="pi pi-trash"></i></Button>
                    </div>                    
                </template>
            </Column> -->
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { Listar } from './js/seguimiento';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();

const Lista = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(true);

onMounted(async () => {
    try {
        const data = await Listar.getData();
        Lista.value = data;
        loading.value = false
    } catch (error) {
        console.error('Error al obtener los tramites:', error);
    }
});

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

function VerFormulario(data) {
    const F = data.flujo
    const P = data.proceso
    const T = data.nrotramite

    store.dispatch('setData', data);

    // localStorage.setItem('nrotramite', T)
    // localStorage.setItem('flujo', F)
    // localStorage.setItem('proceso', P)
    
    router.replace('/'+F+'/'+P)

}


</script>