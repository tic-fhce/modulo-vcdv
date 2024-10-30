<template>
    <div class="card">
        <h4 style="color: blue; text-align: center;">INSCRIPCION DE ALUMNOS A MATERIAS EXTRA</h4><br><br>

        <div class="flex justify-content-center mb-4 gap-3">
            <Dropdown v-model="selectedCarrera" :options="carreras" optionLabel="label" optionValue="value"
                placeholder="Seleccionar Carrera" />
            <Dropdown v-model="selectedYear" :options="years" optionLabel="label" optionValue="value"
                placeholder="Seleccionar Año" />
            <Button label="Listar" icon="pi pi-search" @click="listarTramites" />
            <Button label="Generar Reporte" icon="pi pi-file-pdf" class="p-button-warning" @click="generatePDF" :disabled="!Lista.length" />
        </div>

        <DataTable v-model:filters="filters" :value="Lista" paginator :rows="10" dataKey="id" filterDisplay="row"
            :loading="loading"
            :globalFilterFields="['tramite.id', 'tramite.estado', 'fechaFormateada', 'nombres', 'apellidos', 'ci']">
            <template #header>
                <div class="flex justify-content-end">
                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                </div>
            </template>
            <template #empty> No se encontraron trámites. </template>
            <template #loading> Cargando trámites. Espere por favor. </template>

            <Column field="tramite.id" header="Nro. Trámite" :sortable="true" style="max-width:10%"></Column>
            <Column field="tramite.estado" header="Estado" :sortable="true" style="min-width:10%">
                <template #body="{ data }">
                    <Tag :value="data.tramite.estado" :severity="getSeverity(data.tramite.estado)" />
                </template>
            </Column>
            <Column field="fechaFormateada" header="Fecha Creación" :sortable="true" style="min-width:10%"></Column>
            <Column field="nombres" header="Nombres" :sortable="true" style="min-width:10%"></Column>
            <Column field="apellidos" header="Apellidos" :sortable="true" style="min-width:10%"></Column>
            <Column field="ci" header="CI" :sortable="true" style="min-width:10%"></Column>
            <Column header="Documentos" style="min-width:10%">
                <template #body="{ data }">
                    <div class="flex justify-content-left flex-wrap gap-3">
                        <Button @click="abrirModal(data)" label="Ver" severity="info" raised>
                            <i class="pi pi-eye"></i>
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="visible" header="Documentos del Trámite" :style="{ width: '80%' }">
            <DataTable :value="documentosTramite" dataKey="nombre">
                <Column field="nombre" header="Nombre del Documento" />
                <Column header="Ver Documento">
                    <template #body="{ data }">
                        <a href="" @click.prevent="verDocumento(data)">
                            <i class="pi pi-link"> Ver Documento</i>
                        </a>
                    </template>
                </Column>
                <Column header="Observaciones">
                    <template #body="{ data }">
                        {{ data.observaciones }}
                    </template>
                </Column>
                <Column header="Validar Firma">
                    <template #body="{ data }">
                        <Button v-if="documentoRequiereFirma(data.nombre)" icon="pi pi-check" label="Validar Firma"
                            @click="validarFirma(data)" />
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
import { ref } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { useRouter } from 'vue-router';
import { materiasExtra } from '../js/materiaExtra';
import documentService from '@/services/document.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from '/demo/images/login/logo-fhce.png';

const router = useRouter();
const store = useStore();

const visible = ref(false);
const Lista = ref([]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const loading = ref(false);
const selectedCarrera = ref(null);
const selectedYear = ref(null);
const documentosTramite = ref([]);

const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year };
});

const carreras = [
    { value: 'CE', label: 'C. Educación' },
    { value: 'CI', label: 'C. Información' },
    { value: 'CN', label: 'Cine' },
    { value: 'FIL', label: 'Filosofía' },
    { value: 'HIS', label: 'Historia' },
    { value: 'LIN', label: 'Lingüística' },
    { value: 'LIT', label: 'Literatura' },
    { value: 'PSI', label: 'Psicología' },
    { value: 'TUR', label: 'Turismo' },
];

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
        default:
            return null;
    }
};

function listarTramites() {
    if (!selectedCarrera.value || !selectedYear.value) {
        alert('Por favor, seleccione una carrera y un año.');
        return;
    }
    loading.value = true;

    materiasExtra
        .getData(selectedCarrera.value, selectedYear.value)
        .then((data) => {
            Lista.value = data.map((item) => ({
                ...item,
                fechaFormateada: formatFecha(item.tramite.creacion),
            }));
            loading.value = false;
        })
        .catch((error) => {
            console.error('Error al obtener los trámites:', error);
            loading.value = false;
        });
}

function abrirModal(data) {
    visible.value = true;
    const documentos = [];
    const observaciones = {};

    for (const key in data) {
        if (key.startsWith('d_') && data[key]) {
            const nombreDocumento = key.substring(2);
            documentos.push({
                nombre: nombreDocumento,
                observaciones: '',
                documento: nombreDocumento,
                nrotramite: data.tramite.id,
                flujo: data.tramite.flujo,
            });
        } else if (key.startsWith('r_') && data[key]) {
            const nombreDocumento = key.substring(2);
            observaciones[nombreDocumento] = data[key];
        }
    }

    documentos.forEach((doc) => {
        doc.observaciones = observaciones[doc.nombre] || '';
    });

    documentosTramite.value = documentos;
}

async function verDocumento(data) {
    const archivoURL = await cargarArchivo(data);
    window.open(archivoURL, '_blank');
}

async function cargarArchivo(data) {
    const dat = {
        nombre: data.documento,
        nrotramite: data.nrotramite,
        tabla: 'materia_extra',
        flujo: data.flujo,
    };
    const response = await documentService.recuperarDocumentos(dat);
    const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
    const archivoURL = URL.createObjectURL(archivoBlob);
    return archivoURL;
}

function validarFirma(data) {
    alert('Validando firma para: ' + data.nombre);
}

function documentoRequiereFirma(nombre) {
    const documentosConFirma = [
        'aval'
    ];
    return documentosConFirma.includes(nombre);
}

function cerrarModal() {
    visible.value = false;
}

function formatFecha(creacion) {
    if (!creacion || creacion.length < 3) return '';

    const [year, month, day, hour = 0, minute = 0, second = 0] = creacion;
    const fecha = new Date(year, month - 1, day, hour, minute, second);

    return (
        fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
        ' ' +
        fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    );
}

// Helper function to get the label of the selected career
function getCarreraLabel(value) {
    const carrera = carreras.find((c) => c.value === value);
    return carrera ? carrera.label : '';
}

function generatePDF() {
    const doc = new jsPDF('landscape');

    // Add Logo to the Upper Right Corner
    const imgWidth = 25; // Adjust as needed
    const imgHeight = 15; // Adjust as needed

    const pageWidth = doc.internal.pageSize.getWidth();
    const x = pageWidth - imgWidth - 10;
    const y = 10;

    // Add the logo image
    doc.addImage(logoImage, 'PNG', x, y, imgWidth, imgHeight);

    // Add Title below the logo
    doc.setFontSize(12);
    doc.text('Reporte de Alumnos Inscritos a Materias Extra', 12, y + imgHeight + 10);

    // Add Career and Year
    doc.setFontSize(10);
    doc.text(`Carrera: ${getCarreraLabel(selectedCarrera.value)}`, 12, y + imgHeight + 20);
    doc.text(`Gestión: ${selectedYear.value}`, 12, y + imgHeight + 26);

    // Prepare Table Data
    const tableColumn = [
        'Nro. Trámite',
        'Estado',
        'Fecha Creación',
        'Nombres',
        'Apellidos',
        'CI',
    ];
    const tableRows = [];

    Lista.value.forEach((item) => {
        const rowData = [
            item.tramite.id,
            item.tramite.estado,
            item.fechaFormateada,
            item.nombres,
            item.apellidos,
            item.ci,
        ];
        tableRows.push(rowData);
    });

    // Add Table to PDF
    autoTable(doc, {
        startY: y + imgHeight + 36,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
            0: { cellWidth: 20 }, // Nro. Trámite
            1: { cellWidth: 25 }, // Estado
            2: { cellWidth: 30 }, // Fecha Creación
            6: { cellWidth: 30 }, // Nombres
            7: { cellWidth: 30 }, // Apellidos
            8: { cellWidth: 25 }, // CI
        },
    });

    // Save the PDF
    doc.save('reporte_materiaExtra.pdf');
}
</script>
