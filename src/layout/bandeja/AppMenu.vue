<template>
  <div class="card">
    <Menubar :model="nestedMenuitems">
      <template #item="{ item, props, root }">
        <a v-ripple class="flex items-center" v-bind="props.action">
          <!-- Icono con Badge si el ítem tiene badge -->
          <i :class="item.icon" class="mr-2" style="font-size: 1.2rem;" v-if="item.badge && item.badge > 0">
            <span v-badge="item.badge" class="p-badge-danger"></span>
          </i>
          <!-- Icono sin Badge -->
          <i :class="item.icon" class="mr-2" style="font-size: 1.2rem;" v-else></i>
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import loginService from '../../services/auth.service';
import usuarioService from '../../services/usuario.service';
import seguimientoService from '@/services/seguimiento.service';

const router = useRouter();
const rol = ref();
const usuario = ref();
const countPendientes = ref(0);
const countConcluidos = ref(0);

const nestedMenuitems = ref([
  {
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => redireccionar('/inicio')
  },
  {
    label: 'Trámites Pendientes',
    icon: 'pi pi-clock',
    badge: countPendientes.value,  // Badge con el número de trámites pendientes
    command: () => redireccionar('/tramite-pendiente'),
  },
  {
    label: 'Trámites Concluidos',
    icon: 'pi pi-check-circle',
    badge: countConcluidos.value,  // Badge con el número de trámites concluidos
    command: () => redireccionar('/tramite-concluido')
  },
  {
    label: 'Seguimiento al Tramite',
    icon: 'pi pi-search',
    command: () => redireccionar('/hoja-ruta')
  },
  {
    label: 'Iniciar un Nuevo Tramite',
    icon: 'pi pi-plus-circle',
    command: () => redireccionar('/nuevo-flujo')
  },
  {
    label: 'Hojas de ruta atendidas',
    icon: 'pi pi-check-circle',
    command: () => redireccionar('/atencion'),
    visible: computed(() => rol.value !== 'ESTUDIANTE')
  }
]);

onMounted(() => {
  getUsuario();
  countTP();
  countTC();
});

async function getUsuario() {
  try {
    const { data } = await usuarioService.listarUsuario();
    rol.value = data.rol;
    usuario.value = data.username;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
  }
}

async function countTP() {
  try {
    const { data } = await seguimientoService.countTramitesPendientes();
    countPendientes.value = data;
  } catch (error) {
    console.error('Error al obtener los trámites pendientes:', error);
  }
}

async function countTC() {
  try {
    const { data } = await seguimientoService.countTramitesConcluidos();
    countConcluidos.value = data;
  } catch (error) {
    console.error('Error al obtener los trámites pendientes:', error);
  }
}

watch(countPendientes, (newValue) => {
  nestedMenuitems.value[1].badge = newValue; 
});

watch(countConcluidos, (newValue) => {
  nestedMenuitems.value[2].badge = newValue; 
});

function redireccionar(url) {
  router.replace(url);
}

async function salir() {
  try {
    await loginService.logout();
    router.push('/');
  } catch (error) {
    alert('Error al Salir');
    console.error('Error al cerrar sesión:', error);
  }
}
</script>
