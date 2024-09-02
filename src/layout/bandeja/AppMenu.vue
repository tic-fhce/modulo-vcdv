
<template>
    <div class="card">
          <Menubar :model="nestedMenuitems" class="menu-bar"> 
            <!-- <template #end>
              <Menu ref="menu" :model="overlayMenuItems" :popup="true" />
              <Button type="button" :label="rol" icon="pi pi-user" @click="toggleMenu"style="font-size: 16px; width: auto; border: none; background-color: transparent; color: inherit;" />
            </template> -->
          </Menubar>
          

        <!-- <div class="flex justify-content-left flex-wrap gap-3">
            <div style="width: 48%; text-align: left;">
                <h3>Usuario: {{ usuario }}</h3>
            </div>
            <div style="width: 48%; text-align: right;">
                <h3>{{ rol }}</h3>
            </div>
        </div>
        <br>
        <div class="flex justify-content-left flex-wrap gap-3">
            <Button @click="redireccionar('/unidad-academica')" label="Info" severity="info" raised>Tramites Pendientes</Button>
            <Button @click="redireccionar('/tramite-concluido')" label="Info" severity="info" raised>Tramites Concluidos</Button>
            <Button @click="redireccionar('/nuevo-flujo')" label="Danger" severity="danger" raised>Iniciar Tramite</Button>
        </div> -->

        
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import loginService from '../../services/auth.service';
import usuarioService from '../../services/usuario.service';

const router = useRouter()
const rol = ref()
const usuario = ref()

const menu = ref(null);


onMounted(() => {
    getUsuario()
});

function redireccionar(url){
  router.replace(url)
}

async function getUsuario(){
    const {data} = await usuarioService.listarUsuario()
    //console.log(data)
    rol.value = data.rol
    usuario.value = data.username
}

const nestedMenuitems = ref([
  {
    label: 'Inicio',
    icon: 'pi pi-home',
    command: () => redireccionar('/inicio')
  },
  {
    label: 'Trámites Pendientes',
    icon: 'pi pi-briefcase',
    command: () => redireccionar('/tramite-pendiente')
  },
  {
    label: 'Trámites Concluidos',
    icon: 'pi pi-briefcase',
    command: () => redireccionar('/tramite-concluido')
  },
  {
    label: 'Iniciar un Nuevo Tramite',
    icon: 'pi pi-briefcase',
    command: () => redireccionar('/nuevo-flujo')
  },
  {
    label: 'Seguimiento al Tramite',
    icon: 'pi pi-book',
    command: () => redireccionar('/hoja-ruta')
  },
  {
    label: 'Tutoriales',
    icon: 'pi pi-book'
  }
]);

const overlayMenuItems = ref([
    {
        label: usuario
    },
    {
        label: 'salir',
        icon: 'pi pi-power-off',
        command: salir
    }
]);

const toggleMenu = (event) => {
    menu.value.toggle(event);
};

async function salir(){
    try {
        loginService.logout()
        router.push('/')
    } catch (error) {
        alert("Error al Salir")
    }
}

</script>
