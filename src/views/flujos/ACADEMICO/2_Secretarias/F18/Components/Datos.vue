<template>
    <div class="col-12 text-center mt-1 mb-1">
        <h4>{{ titulo }}</h4>
    </div>
    <div class="grid justify-content-center p-fluid mt-3">
        <div class="field col-12 md:col-4">
            <span class="inline-block mr-2">Universitario:</span>
            <h3 class="inline">{{ nombre }}</h3>
        </div>
        <div class="field col-12 md:col-4">
            <span class="inline-block mr-2">CI:</span>
            <h3 class="inline">{{ ci }}</h3>
        </div>
        <div class="field col-12 md:col-4" v-if="active">
            <span class="inline-block mr-2">Celular:</span>
            <h3 class="inline">{{ celular }}</h3>
        </div>
        <div class="field col-12 md:col-4" v-else>
            <span class="p-float-label">
                <InputText type="number" v-model="celular"></InputText>
                <label for="inputtext">CELULAR</label>
            </span>
        </div>
    </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const nombre = ref();
const ci = ref();
const celular = ref();
const active = ref(false);
const titulo = ref()

const props = defineProps({
  active: Boolean,
  titulo: String,
});

onMounted(() => {
    active.value = props.active
    titulo.value = props.titulo
});


</script>