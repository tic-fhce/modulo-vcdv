<template>
    <div class="card">
        <Toast />
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
            <Column field="usuario" header="Usuario" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.username }}
                </template>
            </Column>
            <Column field="carrera" header="Carrera" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.carrera }}
                </template>
            </Column>
            <Column field="solicitud" header="Tipo de Solicitud Iniciada" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.tipo }}
                </template>
            </Column>
            <Column field="unidad" header="Ubicacion del Tramite" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.unidad }}
                </template>
            </Column>
            <Column field="formulario" header="Tarea realizándose" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.formulario }}
                </template>
            </Column>
            <Column field="estado" header="Estado del tramite" :sortable="true"  :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 10%">
                <template #body="{ data }">
                    <Tag :value="data.estado" :severity="getSeverity(data.estado)" />
                </template>
            </Column>
            <Column field="accion" header="Hoja de Ruta" style="min-width:12.5%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="VerHojaRuta(data)" label="Info" severity="info" raised><i
                                class="pi pi-download"></i></Button>
                    </div>
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
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from "primevue/usetoast";
import { Listar } from './js/tramite';
import { useRouter } from 'vue-router';
import editDocumentService from '@/services/editDocument.service';

const router = useRouter();
const store = useStore();

const Lista = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(true);
const loadingModal = ref(false); 
const toast = useToast();

onMounted(async () => {
    try {
        const data = await Listar.getData();
        Lista.value = data;
        loading.value = false
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener la lista de tramites', life: 3000 });
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
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener la hoja de ruta', life: 3000 });
    } finally {
        loadingModal.value = false; // Ocultar el modal de carga
    }
}

</script>