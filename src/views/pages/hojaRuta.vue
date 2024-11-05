<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">Seguimiento de Trámites</h4>
        <DataTable v-model:filters="filters" :value="Lista" paginator :rows="10" dataKey="id" filterDisplay="row"
            :loading="loading" :globalFilterFields="['nrotramite', 'fecha_inicio', 'solicitud', 'unidad', 'estado']">
            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>
            <template #empty> No se encontraron trámites. </template>
            <template #loading> Cargando trámites. Espere por favor. </template>
            <Column field="nrotramite" header="Nro. Trámite" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.nrotramite }}
                </template>
            </Column>
            <Column field="fecha_inicio" header="Fecha Inicio" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.fecha_inicio }}
                </template>
            </Column>
            <Column field="solicitud" header="Solicitud" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.solicitud }}
                </template>
            </Column>
            <Column field="unidad" header="Ubicación del Trámite" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.ub_tramite }}
                </template>
            </Column>
            <Column field="estado" header="Estado del trámite" :sortable="true" :showFilterMenu="false"
                :filterMenuStyle="{ width: '14rem' }" style="min-width: 10%">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeverity(data.estado)" />
                </template>
            </Column>
            <Column field="accion" header="Hoja de Ruta" style="min-width:12.5%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="VerHojaRuta(data)" label="Info" severity="info" raised><i
                                class="pi pi-download">
                                Descargar</i></Button>
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Modal de Carga -->
        <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false" header="Actualizando datos">
            <div class="flex align-items-center justify-content-center">
                <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                    animationDuration=".5s" />
                <span class="ml-3">Cargando documento, por favor espere...</span>
            </div>
        </Dialog>

    </div>
</template>

<script setup>
import editDocumentService from '@/services/editDocument.service';
import { FilterMatchMode } from 'primevue/api';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Listar } from './ru';

const router = useRouter();
const store = useStore();

const Lista = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(true);
const loadingModal = ref(false); // Estado para el modal de carga

onMounted(async () => {
    try {
        const data = await Listar.getData();
        Lista.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error al obtener los trámites:', error);
    }
});

const getSeverity = (status) => {
    switch (status) {
        case 'true':
            return 'danger';

        case 'terminado':
            return 'success';

        case 'pendiente':
            return 'warning';

        case 'fuera de plazo':
            return 'danger';
    }
};

async function VerHojaRuta(data) {
    const nrotramite = data.nrotramite

    loadingModal.value = true; // Mostrar el modal de carga

    try {
        const response = await editDocumentService.recuperarDocumento(nrotramite);
        if (response) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    } catch (error) {
        alert('Error al obtener la hoja de ruta', error);
    } finally {
        loadingModal.value = false; // Ocultar el modal de carga
    }
}
</script>

<style>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
