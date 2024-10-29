<template>
  <div class="card">
      <h4 style="color: blue; text-align: center;">USUARIOS - PERSONAL ADMINISTRATIVO</h4>
      <DataTable v-model:filters="filters" :value="Lista" paginator :rows="10" dataKey="id" filterDisplay="row"
          :loading="loading" :globalFilterFields="['']">

          <template #header>
              <div class="flex justify-content-end">
                  <InputText v-model="filters['global'].value" placeholder="Buscar..." />
              </div>
          </template>
          <template #empty> No se encontraron usuarios. </template>
          <template #loading> Cargando usuarios. Espere por favor. </template>
          <Column field="id" header="Id" :sortable="true" style="max-width:10%">
              <template #body="{ data }">
                  {{ data.id }}
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
          <Column field="cif" header="CIF" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.cif }}
              </template>
          </Column>
          <Column field="sexo" header="Sexo" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.sexo }}
              </template>
          </Column>
          <Column field="celular" header="Celular" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.celular }}
              </template>
          </Column>
          <Column field="correo" header="Correo" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.correo }}
              </template>
          </Column>
          <Column field="rol" header="Rol" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.rol }}
              </template>
          </Column>
          <Column field="unidad" header="Unidad Academica" :sortable="true" style="min-width:10%">
              <template #body="{ data }">
                  {{ data.unidad }}
              </template>
          </Column>
          <Column field="accion" header="Acciones" style="min-width:10%">
              <template #body="{ data }">
                  <div class="flex justify-content-left flex-wrap gap-3">
                      <Button @click="abrirModal(data)" label="Editar" severity="info" raised><i
                              class="pi pi-pen-to-square"></i></Button>
                      <!-- <Button @click="Eliminar(data)" label="Eliminar" severity="danger" raised
                          class="p-button-danger"><i class="pi pi-trash"></i></Button> -->
                  </div>
              </template>
          </Column>
      </DataTable>

      <!-- Modal de edición -->
      <Dialog v-model:visible="visible" header="Editar Usuario" :style="{ width: '25%' }">
          <form @submit.prevent="guardarCambios">
              <div class="field p-fluid">
                  <label for="id">ID</label>
                  <InputText id="id" :value="usuarioActual.id" disabled />
              </div>
              <div class="field p-fluid">
                  <label for="nombres">Nombres</label>
                  <InputText id="nombres" :value="usuarioActual.nombres" disabled />
              </div>
              <div class="field p-fluid">
                  <label for="apellidos">Apellidos</label>
                  <InputText id="apellidos" :value="usuarioActual.apellidos" disabled />
              </div>
              <div class="field p-fluid">
                  <label for="ci">CI</label>
                  <InputText id="ci" :value="usuarioActual.ci" disabled />
              </div>
              <div class="field p-fluid">
                  <label for="rol">Rol</label>
                  <Dropdown id="rol" v-model="usuarioActual.rol" :options="roles" optionLabel="label"
                      optionValue="value" placeholder="Seleccione el Rol" />
              </div>
              <div class="field p-fluid">
                  <label for="unidad">Unidad Academica</label>
                  <Dropdown id="unidad" v-model="usuarioActual.unidad" :options="unidades" optionLabel="label"
                      optionValue="value" placeholder="Seleccione la Unidad Academica" />
              </div>
              <div class="col-12 flex justify-content-end gap-2 mt-4">
                  <Button label="Cancelar" icon="pi pi-times" @click="visible = false" class="p-button-text" />
                  <Button label="Guardar" icon="pi pi-check" type="submit" class="p-button-primary" />
              </div>
          </form>
      </Dialog>



  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { FilterMatchMode } from 'primevue/api';
import { Usuarios } from '../js/usuarios';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const visible = ref(false);
const Lista = [
  {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      ci: '1234567',
      rol: 'DECANATO',
      unidad: 'FACULTATIVO',
      celular: '78912345',
      correo: 'juan.perez@example.com',
  },
  {
      id: 2,
      nombres: 'María',
      apellidos: 'Gómez',
      ci: '2345678',
      rol: 'VICEDECANATO',
      unidad: 'FACULTATIVO',
      celular: '78923456',
      correo: 'maria.gomez@example.com',
  },
  {
      id: 3,
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      ci: '3456789',
      rol: 'DOCENTE',
      unidad: 'CIENCIAS INFORMACION',
      celular: '78934567',
      correo: 'carlos.rodriguez@example.com',
  },
  {
      id: 4,
      nombres: 'Lucía',
      apellidos: 'Fernández',
      ci: '4567890',
      rol: 'KARDEX',
      unidad: 'CIENCIAS EDUCACION',
      celular: '78945678',
      correo: 'lucia.fernandez@example.com',
  },
  {
      id: 5,
      nombres: 'Ana',
      apellidos: 'López',
      ci: '5678901',
      rol: 'CONSEJO_CARRERA',
      unidad: 'LITERATURA',
      celular: '78956789',
      correo: 'ana.lopez@example.com',
  }
];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const loading = ref(true);

const usuarioActual = ref({
  id: '',
  nombres: '',
  apellidos: '',
  ci: '',
  rol: '',
  unidad: ''
});

// Opciones de selección para Rol y Carrera
const roles = ref([
  { label: 'Decanato', value: 'DECANATO' },
  { label: 'Vicedecanato', value: 'VICEDECANATO' },
  { label: 'Direccion', value: 'DIRECCION' },
  { label: 'Kardex', value: 'KARDEX' },
  { label: 'Docente', value: 'DOCENTE' },
  { label: 'Comision Convalidacion', value: 'COMISION_CONVALIDACION' },
  { label: 'Consejo Carrera', value: 'CONSEJO_CARRERA' },
]);

const unidades = ref([
  { label: 'Facultativo', value: 'FACULTATIVO'},
  { label: 'C. de la Educacion', value: 'CIENCIAS EDUCACION' },
  { label: 'C. de la Informacion', value: 'CIENCIAS INFORMACION' },
  { label: 'Cine', value: 'CINE' },
  { label: 'Filosofia', value: 'FILOSOFIA' },
  { label: 'Historia', value: 'HISTORIA' },
  { label: 'Linguistica', value: 'LINGUISTICA' },
  { label: 'Literatura', value: 'LITERATURA' },
  { label: 'Psicologia', value: 'PSICOLOGIA' },
  { label: 'Turismo', value: 'TURISMO' },
]);

onMounted(async () => {
  try {
      const data = await Usuarios.getData();
      Lista.value = data;
      loading.value = false
  } catch (error) {
      console.error('Error al obtener los usuarios:', error);
  }
});

function abrirModal(data) {
  usuarioActual.value = { ...data };
  visible.value = true;
}

function guardarCambios() {
  if (confirm('Esta seguro de guardar los cambios ?')) {
      console.log('Cambios guardados:', usuarioActual.value);
      visible.value = false;
  }
}

function Eliminar(data) {
  let id = data.id
  console.log('Eliminar usuario: ', id)
}

</script>