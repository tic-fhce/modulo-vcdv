<script setup>
import { ref, watch } from 'vue';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

const currentDate = new Date();
const date = ref(currentDate);
const date2 = ref(currentDate);

// Estado de selección
const selectedRows = ref([]);

// Función para verificar si una fila está seleccionada
const isSelected = (rowData) => {
    return selectedRows.value.includes(rowData);
};

const dat = ref([
    { CODIGO: "c1", CONCEPTO: "co1", MONTO_DISPONIBLE: 10000, PARTIDA: "200000", MONTO_SOLICITADO: 0, descripcion: '', cantidadsolicitada: 0, pureferencial: 0, SALDO: null },
    { CODIGO: "c2", CONCEPTO: "co2", MONTO_DISPONIBLE: 10000, PARTIDA: "200000", MONTO_SOLICITADO: 0, descripcion: '', cantidadsolicitada: 0, pureferencial: 0, SALDO: null },
    { CODIGO: "c3", CONCEPTO: "co3", MONTO_DISPONIBLE: 10000, PARTIDA: "200000", MONTO_SOLICITADO: 0, descripcion: '', cantidadsolicitada: 0, pureferencial: 0, SALDO: null },
    { CODIGO: "c4", CONCEPTO: "co4", MONTO_DISPONIBLE: 10000, PARTIDA: "200000", MONTO_SOLICITADO: 0, descripcion: '', cantidadsolicitada: 0, pureferencial: 0, SALDO: null },
    { CODIGO: "c5", CONCEPTO: "co5", MONTO_DISPONIBLE: 10000, PARTIDA: "200000", MONTO_SOLICITADO: 0, descripcion: '', cantidadsolicitada: 0, pureferencial: 0, SALDO: null }
]);

const columns3 = ref([
    { field: 'descripcion', header: 'DESCRIPCION' },
    { field: 'cantidadsolicitada', header: 'CANTIDAD SOLICITADA' },
    { field: 'pureferencial', header: 'P.U. REFERENCIAL' },
    { field: 'MONTO_SOLICITADO', header: 'MONTO SOLICITADO' }
]);

const cities = ref([
    { name: 'J1', code: 'J1' }, { name: 'J2', code: 'J2' }
]);

const value1 = ref(null);
const value3 = ref(null);
const value4 = ref(null);

// Observa los cambios en los datos seleccionados para actualizar el saldo
watch(selectedRows, (newSelectedRows) => {
    newSelectedRows.forEach(row => {
        row.SALDO = row.MONTO_DISPONIBLE - row.MONTO_SOLICITADO;
    });
}, { deep: true });

</script>

<template>
    <div class="card">
        <h5 class="text-center">FORMULARIO DE SOLICITUD DE SERVICIOS - BIENES DE USO PRESUPUESTADOS</h5>
        <h6 class="text-center">normativa a la que pertenece: Manual de procedimientos de Compra de Bienes y Contratación de Servicios</h6>
        <div class="grid p-fluid mt-3" style="width: 80%; margin-left: 10%; margin-right: 10%;">
            <div class="col-12 md:col-6">
                <FloatLabel>
                    <label for="NomSol">Nombre del solicitante</label>
                    <InputText type="text" id="inputtext" v-model="value1" />
                </FloatLabel>
            </div>
            <div class="col-12 md:col-6">
                <FloatLabel>
                    <label for="Fecha">Fecha de Solicitud</label>
                    <Calendar v-model="date" disabled dateFormat="dd/mm/yy" />
                </FloatLabel>
            </div>
            <div class="col-12 md:col-6">
                <FloatLabel>
                    <label for="Gerencia">Gerencia</label>
                    <Dropdown id="dropdown" :options="cities" v-model="value3" optionLabel="name"></Dropdown>
                </FloatLabel>
            </div>
            <div class="col-12 md:col-6">
                <FloatLabel>
                    <label for="Uni_Jef">Unidad - Jefatura</label>
                    <Dropdown id="dropdown" :options="cities" v-model="value4" optionLabel="name"></Dropdown>
                </FloatLabel>
            </div>
            <div class="grid md:col-10 mx-auto">
                <label for="Mes_soli" class="col-12 md:col-6">Seleccionar el ítem que solicitará según el mes a ejecutarse</label>
                <div class="col-6 md:col-3">
                    <Calendar v-model="date2" view="month" dateFormat="mm/yy" />
                </div>
            </div>

            <div class="card mx-auto">
                <DataTable v-model:selection="selectedRows" :value="dat" selectionMode="multiple" dataKey="CODIGO" tableStyle="min-width: 50rem">
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="CODIGO" header="CODIGO"></Column>
                    <Column field="CONCEPTO" header="CONCEPTO"></Column>
                    <Column field="MONTO_DISPONIBLE" header="MONTO DISPONIBLE (Bs)"></Column>
                    <Column field="PARTIDA" header="PARTIDA"></Column>
                    <Column field="SALDO" header="SALDO">
                        <template #body="slotProps">
                            <div v-if="isSelected(slotProps.data)">
                                {{ slotProps.data.SALDO !== null ? slotProps.data.SALDO : '' }}
                            </div>
                        </template>
                    </Column>
                    <Column v-for="col in columns3" :key="col.field" :field="col.field" :header="col.header">
                        <template #body="slotProps">
                            <template v-if="col.field === 'descripcion'">
                                <div v-if="isSelected(slotProps.data)">
                                    <Textarea v-model="slotProps.data[col.field]" rows="3" cols="30"></Textarea>
                                </div>
                                <div v-else>
                                    {{ slotProps.data[col.field] }}
                                </div>
                            </template>
                            <template v-else>
                                <div v-if="isSelected(slotProps.data)">
                                    <InputNumber v-model="slotProps.data[col.field]" inputId="integeronly" />
                                </div>
                                <div v-else>
                                    {{ slotProps.data[col.field] }}
                                </div>
                            </template>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="card mx-auto">
                <Button label="Enviar" />
            </div>
        </div>
    </div>
</template>
