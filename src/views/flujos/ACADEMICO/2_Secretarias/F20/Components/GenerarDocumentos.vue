<template>
    <Toast />
    <h5>GENERAR CERTIFICADO Y LLENAR</h5>
    <div v-if="loading" class="loading-icon" style="color: red;">
        <i class="pi pi-spin pi-spinner"></i> Espere un momento por favor...
    </div> <br>
    <div class="flex justify-content-left flex-wrap gap-3">
        <Button @click="uploadDocuments" :disabled="uploadDone" severity="success">
            <i class="pi pi-book"></i>&nbsp;Crear Documentos
        </Button>
        <!-- <Button @click="firmarDocumentos" :disabled="!localDocumentos[0].url" severity="warning">
            <i class="pi pi-pencil"></i>&nbsp;Firmar Documentos
        </Button> -->
    </div>
    <br><br>
    <div v-if="uploadDone">
        <DataTable :value="localDocumentos" :paginator="false">
            <Column header="NOMBRE">
                <template #body="{ data }">
                    {{ data.nombre }}
                </template>
            </Column>
            <Column header="EDITAR">
                <template #body="{ data }">
                    <a :href="data.url" @click.prevent="redirectDocument(data)" v-if="data.url">
                        <i class="pi pi-pencil"> Editar Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="EXTRAER DRIVE">
                <template #body="{ data }">
                    <a href="#" @click.prevent="downloadDocument(data)" v-if="data.url">
                        <i class="pi pi-download"> Extraer Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="DOCUMENTO">
                <template #body="{ data }">
                    <a href="#" @click.prevent="verDocumento(data.value)" v-if="data.url">
                        <i class="pi pi-eye"> Ver Documento</i>
                    </a>
                </template>
            </Column>
            <Column header="VERIFICAR FIRMA">
                <template #body="{ data }">
                    <a href="#" @click.prevent="verificarFirmaDocumento(data)" v-if="data.url">
                        <i class="pi pi-file-check"> Verificar</i>
                    </a>
                </template>
            </Column>
            <Column header="FIRMAR">
                <template #body="{ data }">
                    <Button @click="firmarDocumento(data)" :disabled="data.firmado" severity="warning">
                        <i class="pi pi-pencil"> Firmar</i>
                    </Button>
                </template>
            </Column>
        </DataTable>
    </div>


    <Dialog header="Firmar Documentos" v-model:visible="showModal" style="width: 50vw">
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="showModal = false" class="p-button-text" />
            <Button label="Firmar" icon="pi pi-check" @click="firmar" :disabled="!alias" />
        </template>
        <div v-if="loadingTokens" class="loading-icon">
            <i class="pi pi-spin pi-spinner"></i> Detectando tokens...
        </div>
        <div v-else>
            <div v-if="tokens.length === 0">
                <p>No se detectaron tokens conectados.</p>
            </div>
            <div v-else>
                <div class="field">
                    <label for="token">Seleccione Token:</label>
                    <Dropdown id="token" v-model="slot" :options="tokens" optionLabel="serial" optionValue="slot" />
                </div>
                <div class="field">
                    <label for="pin">Ingrese su contraseña (PIN):</label>
                    <Password id="pin" v-model="pin" :feedback="false" toggleMask />
                </div>
                <Button label="Listar Certificados" @click="listarCertificadosAction" :disabled="!pin" />
                <div v-if="loadingCertificados" class="loading-icon">
                    <i class="pi pi-spin pi-spinner"></i> Listando certificados...
                </div>
                <div v-if="certificados.length > 0">
                    <div class="field">
                        <label for="certificado">Seleccione Certificado:</label>
                        <Dropdown id="certificado" v-model="alias" :options="certificados" optionLabel="common_name"
                            optionValue="alias" />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>

    <Dialog header="Verificación de Firmas" v-model:visible="showModalVerificar" style="width: 50vw">
        <div v-if="loadingVerificar" class="loading-icon">
            <i class="pi pi-spin pi-spinner"></i> Verificando firma...
        </div>
        <div v-else>
            <div v-if="firmas.length === 0">
                <p>No se encontraron firmas en el documento.</p>
            </div>
            <div v-else>
                <div class="field">
                    <label for="firmaSeleccionada">Seleccione Firmante:</label>
                    <Dropdown id="firmaSeleccionada" v-model="firmaSeleccionada" :options="firmas"
                        optionLabel="certificado.nombreSignatario" />
                </div>
                <div v-if="firmaSeleccionada">
                    <h5>Datos del Certificado:</h5>
                    <ul>
                        <li><strong>Nombre:</strong> {{ firmaSeleccionada.certificado.nombreSignatario }}</li>
                        <li><strong>CI:</strong> {{ firmaSeleccionada.certificado.ci }}</li>
                        <li><strong>Cargo:</strong> {{ firmaSeleccionada.certificado.cargoSignatario }}</li>
                        <li><strong>Organización:</strong> {{ firmaSeleccionada.certificado.organizacionSignatario }}
                        </li>
                        <li><strong>Email:</strong> {{ firmaSeleccionada.certificado.emailSignatario }}</li>
                        <li><strong>Fecha de Firma:</strong> {{ firmaSeleccionada.fechaFirma }}</li>
                        <!-- Agrega más campos si es necesario -->
                    </ul>
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Cerrar" icon="pi pi-times" @click="showModalVerificar = false" class="p-button-text" />
        </template>
    </Dialog>
</template>

<script setup>
import { useStore } from 'vuex';
import { ref, watch, onMounted } from 'vue';
import { handleUpload, handleUrl, handleDownload } from './driveServiceTribunal';
import documentService from '@/services/document.service';
import designacionTribunalService from '@/services/designacionTribunal.service';
import { listarTokens, listarCertificados, firmarDocumentosApi, validarDocumento } from '@/views/flujos/ACADEMICO/jacobitusService';
import { useToast } from 'primevue/usetoast';

const tablaBD = "designacion_tribunal";
const toast = useToast();
const store = useStore()
const datosrecividos = store.getters.getData

const loading = ref(false);
const uploadDone = ref(false);

const tokens = ref([]);
const certificados = ref([]);
const pin = ref('');
const slot = ref('');
const alias = ref('');
const showModal = ref(false);
const loadingTokens = ref(false);
const loadingCertificados = ref(false);
const documentoActual = ref(null);

const showModalVerificar = ref(false);
const loadingVerificar = ref(false);
const firmas = ref([]);
const firmaSeleccionada = ref(null);

const props = defineProps({
    documentos: Array,
    swdoc: Boolean
});

const localDocumentos = ref([...props.documentos]);

watch(() => props.documentos, (newDocs) => {
    localDocumentos.value = [...newDocs];
});



onMounted(async () => {
    const tD = localDocumentos.value.length;
    let upC = 0;
    try {
        for (const doc of localDocumentos.value) {
            const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'c_' + doc.value };
            const res = await designacionTribunalService.obtenerColumna(dat);
            if (res.data != '') {
                upC++;
            }
        }
        // Verifica si todos los documentos se han cargado
        if (upC === tD) {
            uploadDone.value = true;
            await getDocumentUrls();
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Sin documentos para editar.', life: 5000 });
    }
});

async function verificarFirmadoBD() {
    try {
        // Iterar sobre cada documento y verificar su estado de firma en la base de datos
        for (const doc of localDocumentos.value) {
            const dat = { 'nrotramite': datosrecividos.nrotramite, 'columna': 'f_' + doc.value };
            const res = await designacionTribunalService.obtenerColumna(dat);

            // Almacenar el estado de firma en el documento
            doc.firmado = res.data === 'true' || res.data === true;
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se obtuvieron datos correctamente.', life: 5000 });
    }
}


onMounted(() => {
    verificarFirmadoBD(); // Verificar el estado de firma al cargar el componente
});


async function uploadDocuments() {
    loading.value = true;

    const totalDocuments = localDocumentos.value.length;
    let uploadedCount = 0;

    try {
        localDocumentos.value.forEach(doc => doc.url = '');

        for (const doc of localDocumentos.value) {
            await handleUpload(doc.archivo, datosrecividos.nrotramite, 'c_' + doc.value);
            uploadedCount++;
        }
        // Verifica si todos los documentos se han cargado
        if (uploadedCount === totalDocuments) {
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documentos cargados correctamente', life: 5000 });
            uploadDone.value = true;
            await getDocumentUrls();
        }
    } finally {
        loading.value = false;
    }
}

async function getDocumentUrls() {
    loading.value = true;
    try {
        for (const doc of localDocumentos.value) {
            const url = await handleUrl(datosrecividos.nrotramite, 'c_' + doc.value);
            // Actualiza la URL en el estado
            const docToUpdate = localDocumentos.value.find(d => d.value === doc.value);
            if (docToUpdate) {
                docToUpdate.url = url;
            }
        }
    } finally {
        loading.value = false;
    }
}

async function downloadDocument(data) {
    loading.value = true;
    try {
        const datAct = { 'colum': 'f_' + data.value, 'param': 'false', 'nrotramite': datosrecividos.nrotramite }
        await designacionTribunalService.actulizarColumna(datAct);

        const mensaje = await handleDownload(datosrecividos.nrotramite, 'c_' + data.value, data.value, datosrecividos.flujo, tablaBD);
        toast.add({ severity: 'success', summary: 'Éxito', detail: mensaje, life: 5000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar los documentos', life: 5000 });
    } finally {
        verificarFirmadoBD();
        loading.value = false;
    }
}

function redirectDocument(data) {
    if (!data.url) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'URL no definida para el documento', life: 5000 });
        return;
    }
    window.open(data.url, '_blank');
}

async function verDocumento(value) {
    try {
        const nt = datosrecividos.nrotramite;
        const dat = { nombre: value, nrotramite: nt, tabla: tablaBD, flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const archivoURL = URL.createObjectURL(archivoBlob);
        window.open(archivoURL, '_blank');
    } catch {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Documento no disponible. Por favor, extraiga primero antes de firmar.', life: 5000 });
    }
}

// async function firmarDocumentos() {
//     showModal.value = true;
//     loadingTokens.value = true;
//     try {
//         tokens.value = await listarTokens();
//         if (tokens.value.length > 0) {
//             slot.value = tokens.value[0].slot;
//         } else {
//             toast.add({ severity: 'info', summary: 'Información', detail: 'No se detectaron tokens conectados.', life: 5000 });
//             alert();
//         }
//     } catch (error) {
//         toast.add({ severity: 'error', summary: 'Error', detail: 'Error al detectar tokens', life: 5000 });
//     } finally {
//         loadingTokens.value = false;
//     }
// }

async function firmarDocumento(doc) {
    // Establece el documento actual a firmar
    documentoActual.value = doc;
    showModal.value = true;
    loadingTokens.value = true;
    try {
        tokens.value = await listarTokens();
        if (tokens.value.length > 0) {
            slot.value = tokens.value[0].slot;
        } else {
            toast.add({ severity: 'info', summary: 'Información', detail: 'No se detectaron tokens conectados.', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al detectar tokens', life: 5000 });
    } finally {
        loadingTokens.value = false;
    }
}


// async function recuperarTodosLosDocumentos() {
//     const documentosBase64 = [];
//     try {
//         const nt = datosrecividos.nrotramite;
//         for (const doc of localDocumentos.value) {
//             const value = doc.value;
//             const dat = { nombre: value, nrotramite: nt, tabla: tablaBD, flujo: datosrecividos.flujo };
//             const response = await documentService.recuperarDocumentos(dat);
//             const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
//             const dataBase64 = await blobToBase64(archivoBlob);
//             documentosBase64.push({
//                 id: value,
//                 pdf: dataBase64
//             });
//         }
//     } catch (error) {
//         throw error;
//     }
//     return documentosBase64;
// }

async function recuperarDocumento() {
    const documento = [];
    try {
        const nt = datosrecividos.nrotramite;
        const value = documentoActual.value.value;
        const dat = { nombre: value, nrotramite: nt, tabla: tablaBD, flujo: datosrecividos.flujo };
        const response = await documentService.recuperarDocumentos(dat);
        const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
        const dataBase64 = await blobToBase64(archivoBlob);
        documento.push({
            id: value,
            pdf: dataBase64
        });
    } catch (error) {
        throw error;
    }
    return documento;
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            const base64data = reader.result.split('base64,')[1];
            resolve(base64data);
        };
        reader.onerror = function (error) {
            reject(error);
        };
    });
}

async function firmar() {
    if (!alias.value) {
        toast.add({ severity: 'info', summary: 'Información', detail: 'Por favor, seleccione un certificado.', life: 5000 });
        return;
    }

    let documentos;
    try {
        // documentos = await recuperarTodosLosDocumentos();
        documentos = await recuperarDocumento();
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Documento no disponible. Por favor, extraiga primero antes de firmar.', life: 5000 });
        showModal.value = false;
        return;
    }

    try {
        // Preparar los datos para firmar
        const datosFirma = {
            pin: pin.value,
            alias: alias.value,
            slot: slot.value,
            pdfs: documentos
        };

        // Intentar firmar los documentos
        const pdfsFirmados = await firmarDocumentosApi(datosFirma);

        // Manejar los documentos firmados y prepararlos para guardar
        for (const pdfFirmado of pdfsFirmados) {
            const base64Pdf = pdfFirmado.pdf_firmado;
            const nombreDocumento = pdfFirmado.id;

            // Actualizar la firma del documento en la base de datos
            const datAct = { 'colum': 'f_' + nombreDocumento, 'param': 'true', 'nrotramite': datosrecividos.nrotramite }
            await designacionTribunalService.actulizarColumna(datAct);

            // Convertir el base64 a Blob
            const archivoBlob = base64ToBlob(base64Pdf, 'application/pdf');
            const archivoFile = new File([archivoBlob], `${nombreDocumento}.pdf`, { type: 'application/pdf' });

            // Preparar FormData para enviar al servidor
            const formData = new FormData();
            formData.append('file', archivoFile);
            formData.append('nombre', nombreDocumento);
            formData.append('nrotramite', datosrecividos.nrotramite);
            formData.append('flujo', datosrecividos.flujo);
            formData.append('tabla', tablaBD); // O la tabla correspondiente

            // Guardar el documento en el servidor
            await documentService.guardarDocumentos(formData);
        }
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documentos firmados y guardados correctamente en el servidor.', life: 5000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error durante el proceso de firma o guardado de los documentos.', life: 5000 });
    } finally {
        verificarFirmadoBD();
        showModal.value = false;
    }
}



async function listarCertificadosAction() {
    if (!pin.value || !slot.value) {
        toast.add({ severity: 'info', summary: 'Información', detail: 'Por favor, ingrese su PIN y seleccione un token.', life: 5000 });
        return;
    }
    loadingCertificados.value = true;
    try {
        certificados.value = await listarCertificados(pin.value, slot.value);
        if (certificados.value.length > 0) {
            alias.value = certificados.value[0].alias;
        } else {
            toast.add({ severity: 'info', summary: 'Información', detail: 'No se encontraron certificados.', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al listar certificados.', life: 5000 });
    } finally {
        loadingCertificados.value = false;
    }
}

function base64ToBlob(base64, mime) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
}

async function verificarFirmaDocumento(documento) {
    let responseDoc
    try {
        const nt = datosrecividos.nrotramite;
        const value = documento.value;
        const dat = { nombre: value, nrotramite: nt, tabla: tablaBD, flujo: datosrecividos.flujo };
        responseDoc = await documentService.recuperarDocumentos(dat);
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Documento no disponible. Por favor, extraiga primero antes de verificar.', life: 5000 });
        showModal.value = false;
        return;
    }

    showModalVerificar.value = true;
    loadingVerificar.value = true;
    try {
        const archivoBlob = new Blob([responseDoc.data], { type: responseDoc.headers['content-type'] });
        const dataBase64 = await blobToBase64(archivoBlob);

        // Validar el documento
        firmas.value = await validarDocumento(dataBase64);

        if (firmas.value.length > 0) {
            firmaSeleccionada.value = firmas.value[0]; // Seleccionar la primera firma por defecto
        } else {
            toast.add({ severity: 'info', summary: 'Información', detail: 'No se encontraron firmas en el documento.', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Algo salio mal.', life: 5000 });
    } finally {
        loadingVerificar.value = false
    }
}



defineExpose({
    uploadDone
});
</script>
