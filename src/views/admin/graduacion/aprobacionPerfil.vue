<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">APROBACIONES DE PERFIL DE GRADO</h4><br><br>

        <!-- Formulario de Filtros -->
        <div class="flex justify-content-center mb-4 gap-3">
            <Dropdown v-model="selectedCarrera" :options="carreras" optionLabel="label" optionValue="value" placeholder="Seleccionar Carrera" />
            <Dropdown v-model="selectedYear" :options="years" optionLabel="label" optionValue="value" placeholder="Seleccionar Año" />
            <Button label="Listar" icon="pi pi-search" @click="listarTramites" />
        </div>

        <!-- Tabla de Trámites -->
        <DataTable v-model:filters="filters" :value="filteredTramites" paginator :rows="10" dataKey="id" filterDisplay="row"
            :loading="loading" :globalFilterFields="['nrotramite', 'estado', 'nombres', 'apellidos', 'ci']">
            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>
            <template #empty> No se encontraron trámites. </template>
            <template #loading> Cargando trámites. Espere por favor. </template>

            <!-- Columnas de la Tabla de Trámites -->
            <Column field="nrotramite" header="Nro. Trámite" :sortable="true" style="max-width:10%">
                <template #body="{ data }">
                    {{ data.tramite.id }}
                </template>
            </Column>
            <Column field="estado" header="Estado" :sortable="true" style="min-width:10%">
                <template #body="{ data }">
                    {{ data.estado }}
                </template>
            </Column>
            <Column field="nombres" header="Nombres" :sortable="true" style="min-width:10%">
                <template #body="{ data }">
                    {{ data.nombres }}
                </template>
            </Column>
            <Column field="apellidos" header="Apellidos" :sortable="true" style="min-width:10%">
                <template #body="{ data }">
                    {{ data.apellidos }}
                </template>
            </Column>
            <Column field="ci" header="CI" :sortable="true" style="min-width:10%">
                <template #body="{ data }">
                    {{ data.ci }}
                </template>
            </Column>
            <Column field="documentos" header="Documentos" style="min-width:10%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="abrirModal(data)" label="Ver" severity="info" raised><i class="pi pi-eye"></i></Button>
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Modal para Mostrar Documentos -->
        <Dialog v-model:visible="visible" header="Documentos del Trámite" :style="{ width: '80%' }">
            <DataTable :value="documentosTramite" dataKey="nombre">
                <Column field="nombre" header="Nombre del Documento" />
                <Column field="ver" header="Ver Documento">
                    <template #body="{ data }">
                        <Button icon="pi pi-eye" label="Ver" @click="verDocumento(data)" />
                    </template>
                </Column>
                <Column field="observaciones" header="Observaciones">
                    <template #body="{ data }">
                        <InputText v-model="data.observaciones" placeholder="Observaciones" />
                    </template>
                </Column>
                <Column field="validarFirma" header="Validar Firma">
                    <template #body="{ data }">
                        <Button v-if="documentoRequiereFirma(data.nombre)" icon="pi pi-check" label="Validar Firma" @click="validarFirma(data)" />
                    </template>
                </Column>
            </DataTable>
            <div class="field flex justify-content-end gap-2 mt-4">
                <Button label="Cerrar" icon="pi pi-times" @click="cerrarModal" class="p-button-text" />
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { aprobacionPerfiles } from '../js/aprobacionPerfil';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();

const visible = ref(false);
const Lista = ref([])

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const loading = ref(true);
const selectedCarrera = ref(null);
const selectedYear = ref(null);
const documentosTramite = ref([]);

// Opciones de años para el filtro
const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year };
});

// Definición de carreras (ejemplo)
const carreras = [
    { value: 'c1', label: 'C. Educación' },
    { value: 'c2', label: 'C. Información' },
    { value: 'c3', label: 'Cine' },
    { value: 'c4', label: 'Filosofica' },
    { value: 'c5', label: 'Historia' },
    { value: 'c6', label: 'Linguistica' },
    { value: 'c7', label: 'Literatura' },
    { value: 'c8', label: 'Psicologia' },
    { value: 'c9', label: 'Turismo' },
];

// Filtrar lista por carrera y año
const filteredTramites = computed(() => {
    if (!selectedCarrera.value || !selectedYear.value) return []; // Devuelve vacío si no se selecciona carrera o año
    return Lista.value.filter(item => {
        const matchCarrera = item.tramite.flujo === selectedCarrera.value;
        const matchYear = new Date(item.fecha).getFullYear() === selectedYear.value;
        return matchCarrera && matchYear;
    });
});

// Cargar datos iniciales
onMounted(async () => {
    try {
        const data = await aprobacionPerfiles.getData();
        console.log(data)
        Lista.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error al obtener los trámites:', error);
    }
});

// Función para listar trámites basados en filtros seleccionados
function listarTramites() {

}

// Abrir modal de documentos
function abrirModal(data) {
    visible.value = true;
    documentosTramite.value = [
        { nombre: 'carta_institucion', observaciones: '', documento: data.d_carta_institucion },
        { nombre: 'conclusion_estudios', observaciones: '', documento: data.d_conclusion_estudios },
        { nombre: 'nota_director', observaciones: '', documento: data.d_nota_director },
        { nombre: 'nota_tutor', observaciones: '', documento: data.d_nota_tutor },
        { nombre: 'perfil_grado', observaciones: '', documento: data.d_perfil_grado },
        // Agregar otros documentos según el objeto de datos recibido
    ];
}

// Ver documento (implementación de ejemplo)
function verDocumento(data) {
    console.log('Abriendo documento:', data.documento);
}

// Validar firma (implementación de ejemplo)
function validarFirma(data) {
    console.log('Validando firma para:', data.nombre);
}

// Determinar si un documento requiere firma
function documentoRequiereFirma(nombre) {
    const documentosConFirma = ['carta_institucion', 'nota_director'];
    return documentosConFirma.includes(nombre);
}

// Cerrar modal
function cerrarModal() {
    visible.value = false;
}
</script>
