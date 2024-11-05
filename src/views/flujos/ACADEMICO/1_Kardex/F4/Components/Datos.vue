<template>
    <div class="col-12 text-center mt-1 mb-1">
        <h4>{{ titulo }}</h4>
    </div>
    <div class="card" style="background-color: rgb(238, 249, 247);">
        <h5>DATOS DEL ESTUDIANTE</h5>
        <div class="grid justify-content-center p-fluid mt-3">
            <div class="field col-12 md:col-6">
                <span class="inline-block mr-2">Universitario:</span>
                <h5 class="inline">{{ nombre }}</h5>
            </div>
            <div class="field col-12 md:col-6">
                <span class="inline-block mr-2">C.I.:</span>
                <h5 class="inline">{{ ci }}</h5>
            </div>
            <div class="field col-12 md:col-6">
                <span class="inline-block mr-2">R.U.:</span>
                <h5 class="inline">{{ ru }}</h5>
            </div>
            <div class="field col-12 md:col-6" v-if="active">
                <span class="inline-block mr-2">Celular:</span>
                <h3 class="inline">{{ celular }}</h3>
            </div>
            <div class="field col-12 md:col-6" v-else>
                <span class="p-float-label">
                    <InputText type="number" v-model="celular"></InputText>
                    <label for="inputtext">CELULAR</label>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const nombre = ref();
const ci = ref();
const ru = ref();
const celular = ref();
const active = ref(true);
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