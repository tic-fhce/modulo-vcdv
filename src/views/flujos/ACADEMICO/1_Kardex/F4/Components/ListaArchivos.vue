<template>
  <Toast />
  <div class="">
    <div class="documentos">
      <DataTable :value="documentosTabla" :paginator="false">
        <Column field="archivo" :header="nomDivision" style="width: 16%;"></Column>
        <Column header="ENLACES" style="width: 16%;">
          <template #body="{ data }">
            <a v-for="documento in data.enlaces" :key="documento.nombre" :href="documento.enlace"
              @click.prevent="cargarDocumento(documento.nombre)">
              <i class="pi pi-eye"> Ver Documento</i>
            </a>
          </template>
        </Column>

        <!-- <Column field="observaciones" header="OBSERVACIONES" v-if="mostrarObservaciones"></Column> -->
        <Column v-if="mostrarColumnaObservaciones && mostrarObservaciones" field="observaciones" header="OBSERVACIONES"
          style="width: 16%;">
          <template #body="{ data }">
            <p v-if="data.observaciones">{{ data.observaciones }}</p>
          </template>
        </Column>

        <Column header="REVISION" v-if="mostrarRevision" style="width: 16%;">
          <template #body="{ data }">
            <div v-if="swdoc && (!data.observaciones || data.observaciones != 'correcto')">
              <RadioButton :id="`correcto-${data.index}`" :name="`correcto-${data.index}`" value="correcto"
                v-model="data.correcto.value" />
              <label :for="`correcto-${data.index}`"> Correcto</label>
              <br><br>
              <RadioButton :id="`incorrecto-${data.index}`" :name="`correcto-${data.index}`" value="incorrecto"
                v-model="data.correcto.value" />
              <label :for="`incorrecto-${data.index}`"> Incorrecto</label>
            </div>
          </template>
        </Column>

        <Column field="errores" header="ERRORES" v-if="mostrarRevision" style="width: 16%;">
          <template #body="{ data }">
            <p v-if="data.correcto.value === 'correcto'">{{ data.correcto.value }}</p>
            <Textarea v-model="data.errores.value" v-if="data.correcto.value === 'incorrecto'" rows="3"
              cols="30"></Textarea>
          </template>
        </Column>

        <Column header="VERIFICAR FIRMA" v-if="mostrarVFirma" style="width: 16%;">
          <template #body="{ data }">
            <a href="#" @click.prevent="verificarFirmaDocumento(data)">
              <i class="pi pi-file-check"> Verificar</i>
            </a>
          </template>
        </Column>

        <Column header="FIRMAR" v-if="mostrarFirmarDoc" style="width: 16%;">
          <template #body="{ data }">
            <Button @click="firmarDocumento(data)" :disabled="data.firmado" severity="warning">
              <i class="pi pi-pencil"> Firmar</i>
            </Button>
          </template>
        </Column>

      </DataTable>
      <!-- {{ documentosTabla }} -->
    </div>
  </div>

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
            <li><strong>Organización:</strong> {{ firmaSeleccionada.certificado.organizacionSignatario }}</li>
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

  <!-- Modal para Firmar Documentos -->
  <Dialog header="Firmar Documento" v-model:visible="showModalFirmar" style="width: 50vw">
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="showModalFirmar = false" class="p-button-text" />
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
</template>

<script setup>
import { useStore } from 'vuex';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ref, computed, onMounted } from 'vue';
import documentService from '@/services/document.service';
import { listarTokens, listarCertificados, firmarDocumentosApi, validarDocumento } from '@/views/flujos/ACADEMICO/jacobitusService';
import convalidacion02Service from '@/services/convalidacion02.service';

const confirm = useConfirm();
const toast = useToast();
const store = useStore();

const showModalVerificar = ref(false);
const loadingVerificar = ref(false);
const firmas = ref([]);
const firmaSeleccionada = ref(null);


const datosrecividos = store.getters.getData;
const mostrarObservaciones = ref(false);
const mostrarRevision = ref(false);
const mostrarVFirma = ref(false);
const mostrarFirmarDoc = ref(false);
const sw = ref(false)
const swdoc = !datosrecividos.fechafin

const props = defineProps({
  valueArchivos: Array,
  nomArchivos: Array,
  mostrarObservacionesProp: Boolean,
  mostrarRevision: Boolean,
  mostrarVFirma: Boolean,
  mostrarFirmarDoc: Boolean,
  tabla: String,
  nomDivision: String
});


onMounted(() => {
  mostrarObservaciones.value = props.mostrarObservacionesProp
  mostrarRevision.value = props.mostrarRevision
  mostrarVFirma.value = props.mostrarVFirma
  mostrarFirmarDoc.value = props.mostrarFirmarDoc
});

onMounted(async () => {
  if (mostrarObservaciones.value) {
    try {
      const nt = datosrecividos.nrotramite;
      const observacionesPromises = props.valueArchivos.map(async archivo => {
        const dat = { nrotramite: nt, columna: archivo, tabla: props.tabla };
        const response = await documentService.observacionDocumentos(dat);
        return response.data;
      });

      documentos.value = await Promise.all(observacionesPromises);
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se obtuvieron los datos correctamente', life: 3000 });
    }
  }
});

const mostrarColumnaObservaciones = computed(() => {
  return documentosTabla.value.some(documento => documento.observaciones);
});

const documentos = ref({});
const documentosTabla = computed(() => {
  return props.valueArchivos.map((archivo, index) => ({
    archivo: props.nomArchivos[index],
    observaciones: documentos.value[index],
    enlaces: [
      { nombre: props.valueArchivos[index], enlace: '#' }
    ],
    errores: ref(documentos.value[index]),
    correcto: ref()
  }));
});

async function cargarArchivo(nombreDocumento) {
  const nt = datosrecividos.nrotramite;
  const dat = { 'nombre': nombreDocumento, 'nrotramite': nt, 'tabla': props.tabla, 'flujo': datosrecividos.flujo };
  const response = await documentService.recuperarDocumentos(dat);
  const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });
  const archivoURL = URL.createObjectURL(archivoBlob);
  return archivoURL;
}

async function cargarDocumento(nombreDocumento) {
  const archivoURL = await cargarArchivo(nombreDocumento);
  window.open(archivoURL, '_blank'); // Abre el enlace en una nueva pestaña
}

async function todosDocumentosCorrectos() {
  const documentosParaRevision = documentosTabla.value.filter(documento => !documento.observaciones || documento.observaciones != 'correcto');
  if (documentosParaRevision.every(documento => documento.correcto.value === 'correcto')) { return true }
  else { return false }
}

// const validarRadioButtons = () => {
//   const sinSeleccionar = documentosTabla.value.some(documento => documento.correcto.value !== 'correcto' && documento.correcto.value !== 'incorrecto');
//   if (sinSeleccionar) {
//     alert('Por favor, seleccione todas las opciones');
//     return false;
//   } else {
//     return true;
//   }
// };

const validarRadioButtons = () => {
  const documentosParaRevision = documentosTabla.value.filter(documento => !documento.observaciones || documento.observaciones != 'correcto');
  const sinSeleccionar = documentosParaRevision.some(documento => documento.correcto.value !== 'correcto' && documento.correcto.value !== 'incorrecto');
  if (sinSeleccionar) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Llene los campos solicitados para el envio del trámite', life: 3000 });
    return false;
  } else {
    return true;
  }
};

async function verificarFirmaDocumento(documento) {
  let responseDoc;
  try {
    const nt = datosrecividos.nrotramite;
    const nombreDocumento = documento.enlaces[0].nombre; // Obtener el nombre del documento
    const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: props.tabla, flujo: datosrecividos.flujo };
    responseDoc = await documentService.recuperarDocumentos(dat);
  } catch (error) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Documento no disponible. Por favor, intente nuevamente.', life: 5000 });
    showModalVerificar.value = false;
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Algo salió mal al verificar el documento.', life: 5000 });
  } finally {
    loadingVerificar.value = false;
  }
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

// Modal de Firma
const showModalFirmar = ref(false);
const loadingTokens = ref(false);
const loadingCertificados = ref(false);
const tokens = ref([]);
const certificados = ref([]);
const pin = ref('');
const slot = ref('');
const alias = ref('');
const documentoActual = ref(null);

// Función para firmar un documento individual
async function firmarDocumento(doc) {
  // Establecer el documento actual a firmar
  documentoActual.value = doc.enlaces[0].nombre;
  showModalFirmar.value = true;
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

// Función para listar certificados
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

async function recuperarDocumento() {
  const documento = [];
  try {
    const nt = datosrecividos.nrotramite;
    const value = documentoActual.value;
    const dat = { nombre: value, nrotramite: nt, tabla: props.tabla, flujo: datosrecividos.flujo };
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

// Función para firmar el documento seleccionado
async function firmar() {
  if (!alias.value) {
    toast.add({ severity: 'info', summary: 'Información', detail: 'Por favor, seleccione un certificado.', life: 5000 });
    return;
  }

  let documento;
  try {
    documento = await recuperarDocumento();
  } catch (error) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Documento no disponible. Por favor, intente nuevamente.', life: 5000 });
    showModalFirmar.value = false;
    return;
  }

  try {
    // Preparar los datos para firmar
    const datosFirma = {
      pin: pin.value,
      alias: alias.value,
      slot: slot.value,
      pdfs: documento // Solo el documento actual
    };

    // Intentar firmar el documento
    const pdfsFirmados = await firmarDocumentosApi(datosFirma);

    // Manejar el documento firmado y prepararlo para guardar
    for (const pdfFirmado of pdfsFirmados) {
      const base64Pdf = pdfFirmado.pdf_firmado;
      const nombreDocumento = pdfFirmado.id;

      // Actualizar la firma del documento en la base de datos
      const datAct = { 'colum': 'f_' + nombreDocumento, 'param': 'true', 'nrotramite': datosrecividos.nrotramite };
      await convalidacion02Service.actulizarColumna(datAct);

      // Convertir el base64 a Blob
      const archivoBlob = base64ToBlob(base64Pdf, 'application/pdf');
      const archivoFile = new File([archivoBlob], `${nombreDocumento}.pdf`, { type: 'application/pdf' });

      // Preparar FormData para enviar al servidor
      const formData = new FormData();
      formData.append('file', archivoFile);
      formData.append('nombre', nombreDocumento);
      formData.append('nrotramite', datosrecividos.nrotramite);
      formData.append('flujo', datosrecividos.flujo);
      formData.append('tabla', props.tabla); // O la tabla correspondiente

      // Guardar el documento en el servidor
      await documentService.guardarDocumentos(formData);

      // Actualizar el estado de firmado en el documento actual
      // documentoActual.value.firmado = true;
      // Actualizar el documento en la tabla para reflejar el cambio
      const docIndex = documentosTabla.value.findIndex(d => d.archivo === nombreDocumento);
      if (docIndex !== -1) {
        documentosTabla.value[docIndex].firmado = true;
      }
    }
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Documento firmado y guardado correctamente en el servidor.', life: 5000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error durante el proceso de firma o guardado del documento.', life: 5000 });
  } finally {
    showModalFirmar.value = false;
    // Limpiar los campos del modal
    pin.value = '';
    alias.value = '';
    slot.value = '';
    certificados.value = [];
    tokens.value = [];
  }
}

// Función para convertir Base64 a Blob
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

const tabla = documentosTabla

defineExpose({
  todosDocumentosCorrectos,
  validarRadioButtons,
  tabla
});
</script>