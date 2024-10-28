<template>
  <div class="grid p-fluid">
    <div class="col-12 md:col-4">
      <div class="card">
        <!-- Formulario de Búsqueda -->
        <h4 style="color: blue; text-align: center;">Buscar Usuario</h4>
        <div class="field col-12 md:col-10">
          <label for="ci">CI</label>
          <InputText id="ci" v-model="searchCriteria.ci" placeholder="Ingrese CI" />
        </div>
        <div class="field col-12 md:col-10">
          <label for="complemento">Complemento</label>
          <InputText id="complemento" v-model="searchCriteria.complemento" placeholder="Ingrese Complemento" />
        </div>
        <div class="col-6 md:col-4 lg:col-6">
          <Button label="Buscar" icon="pi pi-search" @click="buscarUsuario" class="p-button-primary" />
        </div>
      </div>
    </div>
    <div class="col-12 md:col-8">
      <div class="card" v-if="usuarioEncontrado">
        <h4 style="color: blue; text-align: center;">Detalles del Usuario</h4>
        <div class="grid">
          <div class="field col-12 md:col-6">
            <label>ID</label>
            <InputText :value="usuarioEncontrado.id" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Nombres</label>
            <InputText :value="usuarioEncontrado.nombres" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Apellidos</label>
            <InputText :value="usuarioEncontrado.apellidos" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>CI</label>
            <InputText :value="usuarioEncontrado.ci" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>CIF</label>
            <InputText :value="usuarioEncontrado.cif" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Sexo</label>
            <InputText :value="usuarioEncontrado.sexo" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Celular</label>
            <InputText :value="usuarioEncontrado.celular" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Correo</label>
            <InputText :value="usuarioEncontrado.correo" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Rol</label>
            <InputText :value="Array.isArray(usuarioEncontrado.rol) ? usuarioEncontrado.rol.join(', ') : ''" disabled />
          </div>
          <div class="field col-12 md:col-6">
            <label>Unidad Academica</label>
            <InputText :value="usuarioEncontrado.unidadAcademica" disabled />
          </div>
        </div>
        <div class="col-6 md:col-2 lg:col-3">
          <Button label="Editar" icon="pi pi-pencil" @click="abrirModalEditar" class="p-button-success" />
        </div>
      </div>
      <div class="card" v-else>
        <div style="display: flex; justify-content: center;">
          <img src="/demo/images/login/user-logo.png" alt="logo" width="80%"/>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="modalVisible" header="Editar Usuario" :style="{ width: '35%' }">
    <form @submit.prevent="guardarCambios">
      <!-- {{ usuarioEditable }} -->
      <div class="grid p-fluid">

        <div class="field col-12" v-if="!usuarioEditable.rol.includes('ESTUDIANTE')">
          <label>Rol</label>
          <div class="p-inputgroup">
            <Dropdown v-model="usuarioEditable.rolSeleccionado" :options="rolesDisponibles1" optionLabel="label"
              optionValue="value" placeholder="Seleccione un Rol" />
            <Button icon="pi pi-plus" @click="agregarRol" class="p-button-primary" />
          </div>
          <div class="selected-roles">
            <Chip v-for="(rol, index) in usuarioEditable.rol" :key="index" :label="rol" @remove="eliminarRol(index)"
              removable />
          </div>
        </div>
        <div class="field col-12" v-else>
          <label>Rol</label>
          <div class="p-inputgroup">
            <Dropdown v-model="usuarioEditable.rolSeleccionado" :options="rolesDisponibles2" optionLabel="label"
              optionValue="value" placeholder="Seleccione un Rol" />
            <Button icon="pi pi-plus" @click="agregarRol" class="p-button-primary" />
          </div>
          <div class="selected-roles">
            <Chip v-for="(rol, index) in usuarioEditable.rol.slice(1)" :key="index" :label="rol"
              @remove="eliminarRol(index + 1)" removable />
          </div>
        </div>


        <div class="field col-12" v-if="!usuarioEditable.rol.includes('ESTUDIANTE')">
          <label>Unidad Académica</label>
          <Dropdown v-model="usuarioEditable.unidadAcademica" :options="unidadesAcademicas" optionLabel="label"
            optionValue="value" placeholder="Seleccione Unidad Académica" />
        </div>
      </div>
      <div class="col-12 flex justify-content-end gap-2 mt-4">
        <Button label="Cancelar" icon="pi pi-times" @click="modalVisible = false" class="p-button-text" />
        <Button label="Guardar" icon="pi pi-check" type="submit" class="p-button-primary" />
      </div>
    </form>
  </Dialog>


</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Campos de búsqueda
const searchCriteria = ref({
  ci: '',
  complemento: ''
});

// Datos del usuario encontrado
const usuarioEncontrado = ref(null
  // {
  //   id: 1,
  //   nombres: 'Juan',
  //   apellidos: 'Pérez',
  //   ci: '1234567',
  //   complemento: 'LP',
  //   cif: 'AB123',
  //   sexo: 'Masculino',
  //   celular: '78912345',
  //   correo: 'juan.perez@example.com',
  //   rol: ['ESTUDIANTE'],
  //   unidadAcademica: 'Ingeniería de Sistemas',
  // }
);

// Modal de edición
const modalVisible = ref(false);
const usuarioEditable = ref({
  id: '',
  rol: [],
  rolSeleccionado: '',
  unidadAcademica: ''
});

// Opciones de roles y unidades académicas
const rolesDisponibles1 = ref([
  { label: 'Decanato', value: 'DECANATO' },
  { label: 'Vicedecanato', value: 'VICEDECANATO' },
  { label: 'Direccion', value: 'DIRECCION' },
  { label: 'Kardex', value: 'KARDEX' },
  { label: 'Docente', value: 'DOCENTE' },
  { label: 'Comision Convalidacion', value: 'COMISION_CONVALIDACION' },
  { label: 'Consejo Carrera', value: 'CONSEJO_CARRERA' },
]);

const rolesDisponibles2 = ref([
  { label: 'Comision Convalidacion', value: 'COMISION_CONVALIDACION' },
]);

const unidadesAcademicas = ref([
  { label: 'Facultativo', value: 'FACULTATIVO' },
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

// Función para buscar el usuario
async function buscarUsuario() {
  try {
    // Realiza una petición al backend para obtener el usuario
    const response = await axios.get('/api/usuarios/buscar', {
      params: {
        ci: searchCriteria.value.ci,
        complemento: searchCriteria.value.complemento
      }
    });
    usuarioEncontrado.value = response.data;
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    usuarioEncontrado.value = null;
  }
}

// Función para abrir el modal de edición
function abrirModalEditar() {
  usuarioEditable.value = {
    id: usuarioEncontrado.value.id,
    rol: [...usuarioEncontrado.value.rol],
    rolSeleccionado: '',
    unidadAcademica: usuarioEncontrado.value.unidadAcademica || ''
  };
  modalVisible.value = true;
}

// Función para agregar un rol
function agregarRol() {
  const rol = usuarioEditable.value.rolSeleccionado;
  if (rol && !usuarioEditable.value.rol.includes(rol)) {
    usuarioEditable.value.rol.push(rol);
    usuarioEditable.value.rolSeleccionado = '';
  }
}

// Función para eliminar un rol
function eliminarRol(index) {
  usuarioEditable.value.rol.splice(index, 1);
}

// Función para guardar los cambios
async function guardarCambios() {
  try {
    // Realiza una petición al backend para actualizar el usuario
    await axios.post('/api/usuarios/actualizar', {
      id: usuarioEditable.value.id,
      rol: usuarioEditable.value.rol,
      unidadAcademica: usuarioEditable.value.unidadAcademica
    });
    // Actualiza los datos en la vista
    usuarioEncontrado.value.rol = [...usuarioEditable.value.rol];
    usuarioEncontrado.value.unidadAcademica = usuarioEditable.value.unidadAcademica;
    modalVisible.value = false;
  } catch (error) {
    console.error('Error al guardar los cambios:', error);
  }
}
</script>
