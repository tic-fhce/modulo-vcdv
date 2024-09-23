<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">HOJAS DE RUTA ATENDIDAS</h4>
        <DataTable v-model:expandedRows="expandedRows" 
           :value="Lista" 
           dataKey="nrotramite"
           tableStyle="min-width: 60rem"
           :filters="filters"
           filterDisplay="menu"
           paginator
           :rows="10">




            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
                <div class="flex flex-wrap justify-end gap-2">
                    <Button text icon="pi pi-plus" label="Expandir Todo" @click="expandAll" />
                    <Button text icon="pi pi-minus" label="Colapsar Todo" @click="collapseAll" />
                </div>
            </template>
            <Column expander style="width: 5rem" />
            <Column field="nrotramite" header="Nro. Tramite"></Column>
            <Column field="f_atencion" header="Ultima fecha de atención"></Column>
            <Column field="solicitud" header="Tramite"></Column>
            <Column field="hr" header="Hoja de Ruta">
                <template #body="slotProps">
                    <Button @click="VerHojaRuta(slotProps.data)" label="Descargar" severity="info" raised>
                        <i class="pi pi-download"> Descargar</i>
                    </Button>
                </template>
            </Column>

            <!-- Template de expansión para mostrar los detalles de fechas y formularios -->
            <template #expansion="slotProps">
                <div class="col-12 mb-2 lg:col-10 lg:mb-0">
                    <h6>Detalles del trámite: {{ slotProps.data.nrotramite }}</h6>
                    <DataTable :value="slotProps.data.detalles" responsiveLayout="scroll">
                        <Column field="fecha_finalizacion" header="Fecha de Atención" style="width: 10%;"></Column>
                        <Column field="formulario" header="Proceso" style="width: 20%;"></Column>
                        <Column field="estado" header="Estado" style="width: 10%;">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.estado"
                                    :severity="getOrderSeverity(slotProps.data.estado)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>
    </div>

    <!-- Modal de Carga -->
    <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false"
        header="Actualizando datos">
        <div class="flex align-items-center justify-content-center">
            <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                animationDuration=".5s" />
            <span class="ml-3">Cargando documento, por favor espere...</span>
        </div>
    </Dialog>
</template>

<script setup>
import { FilterMatchMode } from 'primevue/api';
import editDocumentService from '@/services/editDocument.service';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Listar } from './atencion';

const router = useRouter();

const Lista = ref([]);
const expandedRows = ref([]);
const loading = ref(true);
const loadingModal = ref(false);

// Configuración de filtros para la búsqueda global
const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(async () => {
    try {
        const data = await Listar.getData();
        Lista.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error al obtener los trámites:', error);
    }
});

async function VerHojaRuta(data) {
    const nrotramite = data.nrotramite;

    loadingModal.value = true;

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
        loadingModal.value = false;
    }
}

function expandAll() {
    expandedRows.value = Lista.value;
}

function collapseAll() {
    expandedRows.value = [];
}

const getOrderSeverity = (status) => {
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
</script>
