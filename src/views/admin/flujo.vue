<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />
        <h4 style="color: blue; text-align: center;">PROCESOS Y PROCEDIMIENTOS</h4>
        <DataTable v-model:filters="filters" :value="filteredLista" paginator :rows="10" dataKey="id"
            filterDisplay="row" :loading="loading" :globalFilterFields="['flujo', 'formulario']">
            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>
            <template #empty> No se encontraron procesos. </template>
            <template #loading> Cargando Procesos. Espere por favor. </template>

            <!-- Columnas de la tabla -->
            <Column field="flujo" header="Flujo" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.flujo }}
                </template>
            </Column>
            <Column field="formulario" header="Proceso" :sortable="true" style="min-width: 10%">
                <template #body="{ data }">
                    {{ data.formulario }}
                </template>
            </Column>

            <!-- Botón de Editar -->
            <Column field="editar" header="Editar" style="min-width:12.5%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="abrirModal(data.flujo)" label="Editar" severity="info" raised>
                            <i class="pi pi-pen-to-square"> Editar</i>
                        </Button>
                    </div>
                </template>
            </Column>

            <!-- Botones de Habilitar/Inhabilitar -->
            <Column field="accion" header="Acciones" style="min-width:12.5%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button v-if="data.habilitado == 'true'" @click="toggleHabilitado(data)" label="Habilitar"
                            severity="success" raised>
                            <i class="pi pi-eye"> Habilitado</i>
                        </Button>
                        <Button v-else @click="toggleHabilitado(data)" label="Inhabilitar" severity="warning" raised>
                            <i class="pi pi-eye-slash"> Inhabilitado</i>
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Modal de Edición de Todos los Procesos en el Flujo -->
        <Dialog v-model:visible="isModalVisible" :header="`Editar Procedimientos: ${flujoSeleccionado}`"
            :style="{ width: '80%' }">
            <div v-if="procesosFlujoSeleccionado.length">
                <DataTable :value="procesosFlujoSeleccionado" :rows="10" dataKey="id">
                    <Column field="proceso" header="Proceso" />

                    <Column field="proceso_sig" header="Proceso Siguiente">
                        <template #body="{ data }">
                            <div v-if="data.proceso_sig === null">
                                <div>si: {{ data.condiciones.si }} </div>
                                <div>no: {{ data.condiciones.no }} </div>
                            </div>
                            <div v-else>
                                {{ data.proceso_sig }}
                            </div>
                        </template>
                    </Column>

                    <!-- Columna Formulario -->
                    <Column field="formulario" header="Formulario">
                        <template #body="{ data }">
                            <InputText v-model="data.formulario" placeholder="Formulario" />
                        </template>
                    </Column>

                    <!-- Columna Rol con Select -->
                    <Column field="role" header="Rol">
                        <template #body="{ data }">
                            <Dropdown v-model="data.role" :options="roles" optionLabel="label" optionValue="value"
                                placeholder="Seleccione un Rol" />
                        </template>
                    </Column>

                    <!-- Columna Tiempo Editable (Horas) -->
                    <Column field="tiempo" header="Tiempo (Horas)">
                        <template #body="{ data }">
                            <InputText v-model="data.tiempo" placeholder="Tiempo en horas" />
                        </template>
                    </Column>



                    <!-- Botón Actualizar -->
                    <Column field="actualizar" header="Actualizar">
                        <template #body="{ data }">
                            <Button @click="actualizarProceso(data)" label="Actualizar" icon="pi pi-check"
                                class="p-button-primary" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="field flex justify-content-end gap-2 mt-4">
                <Button label="Cerrar" icon="pi pi-times" @click="cerrarModal" class="p-button-text" />
            </div>
        </Dialog>
    </div>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from 'primevue/api';
import { Flujos } from './js/flujo';
import { useRouter } from 'vue-router';
import flujoService from '@/services/flujo.service';

const router = useRouter();
const store = useStore();

const Lista = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const loading = ref(true);

const filteredLista = computed(() => Lista.value.filter(item => item.proceso === 'P1'));

const isModalVisible = ref(false);
const flujoSeleccionado = ref(null);
const procesosFlujoSeleccionado = ref([]);
const confirm = useConfirm();
const toast = useToast();

const roles = ref([
    { label: 'Decanato', value: 1 },
    { label: 'Vicedecanato', value: 2 },
    { label: 'Direccion', value: 3 },
    { label: 'Kardex', value: 4 },
    { label: 'Docente', value: 6 },
    { label: 'Estudiante', value: 7 },
    { label: 'Comision Convalidacion', value: 10 },
    { label: 'Consejo Carrera', value: 11 },
]);

onMounted(async () => {
    cargarFlujos();
});

function abrirModal(flujo) {
    flujoSeleccionado.value = flujo;
    procesosFlujoSeleccionado.value = Lista.value.filter(item => item.flujo === flujo);
    isModalVisible.value = true;
}

function cerrarModal() {
    isModalVisible.value = false;
}

async function actualizarProceso(data) {
    confirm.require({
        message: '¿Está seguro de actualizar estos datos?',
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                const datos = { 'id': data.id, 'formulario': data.formulario, 'rol': data.role, 'tiempo': data.tiempo };
                await flujoService.ActualizarProcedimiento(datos);
                await cargarFlujos();
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proceso actualizado correctamente', life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar datos', life: 3000 });
            }
        }
    });
}

async function cargarFlujos() {
    try {
        const data = await Flujos.getData();
        Lista.value = data;
        loading.value = false;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los flujos', life: 3000 });
    }
}

async function toggleHabilitado(data) {
    const nuevoEstado = data.habilitado === 'false' ? 'true' : 'false';
    const mensaje = nuevoEstado === 'true' 
        ? '¿Está seguro de habilitar el proceso?' 
        : '¿Está seguro de inhabilitar el proceso?';

    confirm.require({
        message: mensaje,
        header: 'Confirmación',
        icon: 'pi pi-question-circle',
        accept: async () => {
            try {
                const datos = { 'id': data.id, 'habilitado': nuevoEstado };
                await flujoService.ActualizarHabilitado(datos);
                await cargarFlujos();
                toast.add({ severity: 'success', summary: 'Éxito', detail: `Proceso ${nuevoEstado === 'true' ? 'habilitado' : 'inhabilitado'} correctamente`, life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Error al intentar cambiar de estado', life: 3000 });
            }
        }
    });
}

</script>

