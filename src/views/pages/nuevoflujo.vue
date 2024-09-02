<template>
  <div class="layout-main flex flex-column justify-content-center align-items-center px-3 py-3 md:py-0">
    <div class="card-tam-flujo">
      <div class="card">
        <h1 style="text-align: center;">INICIAR UN NUEVO TRAMITE</h1>
        <Listbox v-model="listboxValue" :options="listboxValues" optionLabel="formulario" :filter="true" /><br><br>
        <div class="flex justify-content-left flex-wrap gap-3">
          <Button @click="sendSelectedValue()">Enviar</Button>
          <!-- <Button @click="redireccionar('/tramite-pendiente')" label="Warning" severity="warning" raised>Cancelar</Button> -->
        </div>

        <!-- Modal de Carga -->
        <Dialog v-model:visible="loadingModal" :modal="true" :closable="false" :draggable="false" :resizable="false" header="Cargando datos">
            <div class="flex align-items-center justify-content-center">
                <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" fill="var(--surface-ground)"
                    animationDuration=".5s" />
                <span class="ml-3">Iniciando Tramite, espere porfavor...</span>
            </div>
        </Dialog>

      </div>
    </div>
  </div>
</template>
<script setup>
import AppFooter from '@/layout/AppFooter.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import flujoService from './../../services/flujo.service'
import workflowService from './../../services/workflow.service'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue';
import seguimientoService from "@/services/seguimiento.service";
import editDocumentService from '@/services/editDocument.service';

const router = useRouter()

const listboxValues = ref();
const listboxValue = ref(null);

const loadingModal = ref(false); // Estado para el modal de carga

onMounted(() => {
  ListaFlujosP1();
});

function redireccionar(url) {
  router.replace(url)
}

async function sendSelectedValue() {
  if (listboxValue.value) {
    const datos = listboxValue.value
    const confirmed = confirm('¿Estás seguro de que deseas iniciar el tramite de ' + datos.formulario + '?');
    if (confirmed) {
      const { data } = await workflowService.inicioFlujo(datos);
      if (data) {
        const l = data[0];
        const x = l.creacion;
        const fechaInicio = (x[2]) + "/" + (x[1]) + "/" + (x[0]) + "  " + (x[3]) + ":" + (x[4]);
        const fecha = (x[2]) + "/" + (x[1]) + "/" + (x[0]);
        const hora = (x[3]) + ":" + (x[4]) + ":" + (x[5]);

        const datosFormateados = {
          nrotramite: l.id,
          fecha: fecha,
          hora: hora,
          tipo_tramite: 'ACADEMICO',
          carrera: l.carrera,
          procedencia: l.unidad,
          referencia: l.formulario
        }

        loadingModal.value = true;

        try {
          await editDocumentService.editarDocumento(datosFormateados);
          router.replace("/tramite-pendiente");
        } catch (error) {
          alert('Error al generar la hoja de ruta', error);
          router.replace("/nuevo-flujo");
        } finally {
          loadingModal.value = false; // Ocultar el modal de carga
        }
      }
    } else {
      // El usuario canceló, no hagas nada
    }
  } else {
    alert('No se ha seleccionado ningún valor');
  }
};

async function ListaFlujosP1() {
  try {
    const flujos = await flujoService.ListarInicioFlujo();
    //console.log(flujos)
    const opcionesFlujo = [];
    for (const flujo of flujos.data) {
      opcionesFlujo.push({ flujo: flujo.flujo, formulario: flujo.formulario });
    }
    listboxValues.value = opcionesFlujo;
  } catch (error) {
    console.error('Error al obtener los flujos:', error);
  }
}

</script>