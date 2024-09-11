<template>
  <div class="">
    <div class="documentos">
      <DataTable :value="documentosTabla" :paginator="false">
        <Column field="docente" header="DOCENTE" v-if="mostrarDocente"></Column>

        <Column field="archivo" header="DOCUMENTO"></Column>
        <Column header="ENLACES">
          <template #body="{ data }">
            <a v-for="documento in data.enlaces" :key="documento.nombre" :href="documento.enlace"
              @click.prevent="cargarDocumento(documento.nombre)">
              <i class="pi pi-link"></i> {{ documento.nombre }}
            </a>
          </template>
        </Column>
        <Column field="observaciones" header="OBSERVACIONES" v-if="mostrarObservaciones"></Column>

        <Column header="REVISION" v-if="mostrarRevision">
          <template #body="{ data }">
            <div v-if="swdoc">
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

        <Column field="errores" header="OBSERVACIONES" v-if="mostrarRevision">
          <template #body="{ data }">
            <p v-if="data.correcto.value === 'correcto'">{{ data.correcto.value }}</p>
            <Textarea v-model="data.errores.value" v-if="data.correcto.value === 'incorrecto'" rows="3"
              cols="30"></Textarea>
          </template>
        </Column>

        <Column header="FIRMAR">
          <template #body="{ data }">
            <Button v-if="data.tipo === swfirmar && swdoc" @click="irAFirmar(data.tipo)" severity="info"><i class="pi pi-pencil">
                Firmar</i></Button>
          </template>
        </Column>
      </DataTable>
      <!-- {{ documentosTabla }} -->
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { ref, computed, onMounted } from 'vue';
import documentService from '@/services/document.service';

const store = useStore();
const datosrecividos = store.getters.getData;
const mostrarObservaciones = ref(false);
const mostrarRevision = ref(true);
const sw = ref(false)
const swdoc = !datosrecividos.fechafin
const swfirmar = ref(null)
const mostrarDocente = ref(false)

const props = defineProps({
  valueArchivos: Array,
  nomArchivos: Array,
  mostrarObservacionesProp: Boolean,
  mostrarRevision: Boolean,
  tabla: String,
  swfirmar: String,
  mostrarDocente: Boolean,
});


onMounted(() => {
  mostrarObservaciones.value = props.mostrarObservacionesProp
  mostrarRevision.value = props.mostrarRevision
  swfirmar.value = props.swfirmar
  mostrarDocente.value = props.mostrarDocente
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
      console.error('Error al obtener los datos:', error);
    }
  }
});

const shouldShowFirmarButton = computed(() => {
  return props.valueArchivos.includes(props.swfirmar);
});

const documentos = ref({});
const documentosTabla = computed(() => {
  return props.valueArchivos.map((archivo, index) => ({
    docente: 'Docente 1',
    archivo: props.nomArchivos[index],    
    observaciones: documentos.value[index],
    enlaces: [
      { nombre: props.valueArchivos[index], enlace: '#' }
    ],
    errores: ref(),
    correcto: ref(),
    tipo: archivo
  }));
});

async function cargarArchivo(nombreDocumento) {
  const nt = datosrecividos.nrotramite;
  const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: props.tabla, flujo: datosrecividos.flujo };
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
  if (documentosTabla.value.every(documento => documento.correcto.value === 'correcto')) { return true }
  else { return false }
}

const validarRadioButtons = () => {
  const sinSeleccionar = documentosTabla.value.some(documento => documento.correcto.value !== 'correcto' && documento.correcto.value !== 'incorrecto');
  if (sinSeleccionar) {
    alert('Por favor, seleccione todas las opciones');
    return false;
  } else {
    return true;
  }
};


const tabla = documentosTabla

defineExpose({
  todosDocumentosCorrectos,
  validarRadioButtons,
  tabla
});


async function irAFirmar(nombreDocumento) {
    // try {
    //     const nt = datosrecividos.nrotramite;
    //     const dat = { nombre: nombreDocumento, nrotramite: nt, tabla: 'convocatoria', flujo: datosrecividos.flujo };
    //     const response = await documentService.recuperarDocumentos(dat);
    //     const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });

    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         const base64data = reader.result.split(',')[1];
    //         globalStore.documento = base64data;
    //         router.push({ name: 'firmar' });
    //     };
    //     reader.readAsDataURL(archivoBlob);
    // } catch (error) {
    //     alert('Descargue el documento antes por favor');
    // }
}
</script>