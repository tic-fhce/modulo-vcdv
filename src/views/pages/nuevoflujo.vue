<template>
  <div class="layout-main flex flex-column justify-content-center align-items-center px-3 py-3 md:py-0">
    <div style="width: 60%;">
      <div class="card">
        <h1 style="text-align: center;">INICIAR UN NUEVO TRAMITE</h1>
        <Listbox v-model="listboxValue" :options="listboxValues" optionLabel="formulario" :filter="true" /><br><br>
        <div class="flex justify-content-left flex-wrap gap-3">
          <Button @click="sendSelectedValue()">Enviar</Button>
          <!-- <Button @click="redireccionar('/tramite-pendiente')" label="Warning" severity="warning" raised>Cancelar</Button> -->
        </div>

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

const router = useRouter()

const listboxValues = ref();
const listboxValue = ref(null);

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
      const response = await workflowService.inicioFlujo(datos);
      router.replace("/tramite-pendiente");
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