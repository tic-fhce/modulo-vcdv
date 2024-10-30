<template>
    <div class="grid">
        <!-- Usuarios del Personal Administrativo -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Personal Administrativo</span>
                        <div class="text-900 font-medium text-xl">{{ adminUsers }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ newAdminUsers }} nuevos </span>
                <span class="text-500">desde la semana pasada</span>
            </div>
        </div>
        <!-- Usuarios Estudiantes -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Estudiantes</span>
                        <div class="text-900 font-medium text-xl">{{ studentUsers }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ newStudentUsers }} nuevos </span>
                <span class="text-500">desde la semana pasada</span>
            </div>
        </div>
        <!-- Trámites Atendidos -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Trámites Atendidos</span>
                        <div class="text-900 font-medium text-xl">{{ tramitesAtendidos }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ tramitesAtendidosHoy }} </span>
                <span class="text-500">atendidos hoy</span>
            </div>
        </div>
        <!-- Trámites Pendientes -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Trámites Pendientes</span>
                        <div class="text-900 font-medium text-xl">{{ tramitesPendientes }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-clock text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium">{{ tramitesPendientesHoy }} </span>
                <span class="text-500">nuevos hoy</span>
            </div>
        </div>

        <!-- Gráfico de Barras: Tiempo Promedio por Flujo -->
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Tiempo Promedio por Flujo (en minutos)</h5>
                <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
        </div>

        <!-- Tabla: Trámites por Estado y Flujo -->
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Trámites por Estado y Flujo</h5>
                <DataTable :value="tramitesEstado" responsiveLayout="scroll">
                    <Column field="flujo" header="Flujo"></Column>
                    <Column field="tramites_terminados" header="Terminados"></Column>
                    <Column field="tramites_pendientes" header="Pendientes"></Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import axios from 'axios';

const { isDarkTheme } = useLayout();

// Variables para las tarjetas iniciales
const adminUsers = ref(0);
const newAdminUsers = ref(0);
const studentUsers = ref(0);
const newStudentUsers = ref(0);
const tramitesAtendidos = ref(0);
const tramitesAtendidosHoy = ref(0);
const tramitesPendientes = ref(0);
const tramitesPendientesHoy = ref(0);

// Datos para las estadísticas
const estadisticasFlujo = ref([]);
const tramitesEstado = ref([]);

// Datos para el gráfico
const chartData = ref({});
const chartOptions = ref({});

onMounted(() => {
    obtenerDatosIniciales();
    obtenerEstadisticasFlujo();
    obtenerTramitesEstado();
    aplicarTema();
});

// Función para obtener los datos de las tarjetas iniciales
const obtenerDatosIniciales = async () => {
    try {
        const response = await axios.get('/api/datos-iniciales');
        const data = response.data;
        adminUsers.value = data.adminUsers;
        newAdminUsers.value = data.newAdminUsers;
        studentUsers.value = data.studentUsers;
        newStudentUsers.value = data.newStudentUsers;
        tramitesAtendidos.value = data.tramitesAtendidos;
        tramitesAtendidosHoy.value = data.tramitesAtendidosHoy;
        tramitesPendientes.value = data.tramitesPendientes;
        tramitesPendientesHoy.value = data.tramitesPendientesHoy;
    } catch (error) {
        console.error('Error al obtener los datos iniciales:', error);
    }
};

// Función para obtener las estadísticas de tiempo promedio por flujo
const obtenerEstadisticasFlujo = async () => {
    try {
        const response = await axios.get('/api/estadisticas-flujo');
        estadisticasFlujo.value = response.data;
        actualizarChartData();
    } catch (error) {
        console.error('Error al obtener las estadísticas de flujo:', error);
    }
};

// Función para obtener el número de trámites terminados y pendientes por flujo
const obtenerTramitesEstado = async () => {
    try {
        const response = await axios.get('/api/tramites-estado');
        tramitesEstado.value = response.data;
    } catch (error) {
        console.error('Error al obtener los trámites por estado:', error);
    }
};

// Actualizar los datos del gráfico
const actualizarChartData = () => {
    chartData.value = {
        labels: estadisticasFlujo.value.map(item => item.flujo),
        datasets: [
            {
                label: 'Tiempo Promedio (min)',
                data: estadisticasFlujo.value.map(item => item.promedio_tiempo_minutos),
                backgroundColor: '#42A5F5',
            }
        ]
    };
};

// Aplicar el tema al gráfico
const aplicarTema = () => {
    chartOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: isDarkTheme.value ? '#ebedef' : '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: isDarkTheme.value ? '#ebedef' : '#495057'
                },
                grid: {
                    color: isDarkTheme.value ? 'rgba(160, 167, 181, .3)' : '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: isDarkTheme.value ? '#ebedef' : '#495057'
                },
                grid: {
                    color: isDarkTheme.value ? 'rgba(160, 167, 181, .3)' : '#ebedef'
                }
            }
        }
    };
};

watch(isDarkTheme, aplicarTema);
</script>
