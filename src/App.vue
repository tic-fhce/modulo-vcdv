<!-- <script setup>
  import {ref} from 'vue'
  import mostrarService from './services/mostrar.service'
  import { useRouter } from "vue-router"

  const router = useRouter()
  const datos = ref([])

  async function mostrar(){
    const {data} = await mostrarService.mostrarFormulario({flujo: "F1", proceso: "P1"})
    router.push('\solicitudCartaRecomendacion')
    datos.value = data
  }

  
</script>

<template>
   <button type="button" @click="mostrar()">Siguiente</button>
   {{ datos }}

  <router-view></router-view>
</template>

<style scoped>

</style> -->

<script setup>
// import { onMounted } from 'vue';
// import { useRouter } from 'vue-router';

// const router = useRouter();

// onMounted(checkTokenValidity);

// function checkTokenValidity() {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     if (isTokenExpired(token)) {
//       localStorage.removeItem('access_token');
//       router.push('/');
//     } 
//     // else {
//     //   // El token aún es válido
//     //   console.log('El token aún es válido');
//     // }
//   } 
//   // else {
//   //   // No hay token almacenado, el usuario probablemente no está autenticado
//   //   console.log('No hay token almacenado, el usuario probablemente no está autenticado');
//   // }
// }

// function isTokenExpired(token) {
//   const tokenData = JSON.parse(atob(token.split('.')[1])); // Decodificar la parte de datos del token
//   const expirationTime = tokenData.exp * 1000; // Convertir la fecha de expiración a milisegundos
//   const currentTime = new Date().getTime(); // Obtener la fecha y hora actuales en milisegundos
//   return currentTime > expirationTime; // Comparar la fecha y hora actuales con la fecha de expiración del token
// }
</script>

<template>
    <router-view />
</template>

<style scoped></style>
