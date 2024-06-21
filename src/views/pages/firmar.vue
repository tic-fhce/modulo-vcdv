<template>
    <div class="card">
        <h1>Jacobitus - FIDO!</h1>
        <p>Para verificar si existe algún token conectado pulse sobre "Verificar Token".</p>
        <p>Para listar los certificados pulse sobre "Listar Certificados".</p>
        <div class="container features">
            <div class="row">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <h3 class="feature-title">Tokens</h3>
                    <input value="Verificar" type="button" @click="listar" />
                    <p>{{ tokens }}</p>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <h3 class="feature-title">Certificados</h3>
                    <div>Pin : <input v-model="pin" type="password" /></div>
                    <div>Slot: <input v-model="slot" type="text" /></div>
                    <input value="Listar" type="button" @click="certificados" />
                    <p>{{ certificadosList }}</p>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <h3 class="feature-title">Firma</h3>
                    <div>Pin &nbsp;&nbsp;: <input v-model="pin2" type="password" /></div>
                    <div>Alias: <input v-model="alias" type="text" /></div>
                    <div>Slot &nbsp;: <input v-model="slot2" type="text" /></div>
                    <div><input id="archivo" disabled="false" type="file" @change="handleFileSelect" /></div>
                    <input value="Firmar" type="button" @click="firmar" :disabled="!archivoSeleccionado" />
                    <div id="list"></div>
                </div>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { globalStore } from './globalStore';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const tokens = ref('');
const pin = ref('');
const slot = ref('');
const certificadosList = ref('');
const pin2 = ref('');
const alias = ref('');
const slot2 = ref('');
const archivoSeleccionado = ref(false);

onMounted(() => {
    //const documentoBase64 = localStorage.getItem('documento');
    const documentoBase64 = globalStore.documento
    if (documentoBase64) {
        cargarArchivo(documentoBase64);
    }
});

function cargarArchivo(base64data) {
    const byteCharacters = atob(base64data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new Blob([byteArray], { type: 'application/pdf' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([file], "documento.pdf"));

    const input = document.getElementById('archivo');
    input.files = dataTransfer.files;
    archivoSeleccionado.value = true;
}

const listar = () => {
    axios.get('https://localhost:9000/api/token/connected')
        .then(response => {
            if (response.data.finalizado) {
                tokens.value = '';
                const tokensData = response.data.datos.tokens;
                for (let i = 0; i < tokensData.length; i++) {
                    tokens.value += `${tokensData[i].serial} - (${tokensData[i].slot}) `;
                    if (i === 0) {
                        slot.value = tokensData[i].slot;
                        slot2.value = tokensData[i].slot;
                    }
                }
            }
        })
        .catch(e => {
            alert(e);
        });
};

const certificados = () => {
    axios.post('https://localhost:9000/api/token/data', {
        pin: pin.value,
        slot: slot.value
    })
        .then(response => {
            if (response.data.finalizado) {
                certificadosList.value = '';
                const elements = response.data.datos.data_token.data;
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].tipo === 'X509_CERTIFICATE') {
                        if (certificadosList.value === '') {
                            alias.value = elements[i].alias;
                        }
                        certificadosList.value += `${elements[i].common_name} - (${elements[i].alias}) `;
                    }
                }
            }
        })
        .catch(e => {
            alert(e);
        });
};

const handleFileSelect = (evt) => {
    var files = evt.target.files;
    if (files.length > 0) {
        archivoSeleccionado.value = true;
    }
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name),
            '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes, Ultima Modificación: ',
            f.lastModifiedDate ?
                f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
};

const firmar = () => {
    const files = document.getElementById('archivo').files;
    if (files.length) {
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = () => {
            const data = reader.result.split('base64,')[1];
            axios.post('https://localhost:9000/api/token/firmar_lote_pdfs', {
                pin: pin2.value,
                alias: alias.value,
                slot: slot2.value,
                pdfs: [{
                    id: files[0].name,
                    pdf: data
                }]
            })
            .then(response => {
                if (response.data.finalizado) {
                    const pdfs = response.data.datos.pdfs_firmados;
                    for (let i = 0; i < pdfs.length; i++) {
                        guardarEnServidor(pdfs[i].pdf_firmado, files[0].name);
                    }
                    // const pom = document.createElement('a');
                    // const pdfs = response.data.datos.pdfs_firmados;
                    // for (let i = 0; i < pdfs.length; i++) {
                    //     pom.setAttribute('href', 'data:application/pdf;base64,' + pdfs[i].pdf_firmado);
                    //     pom.setAttribute('download', files[0].name);
                    //     const event = document.createEvent('MouseEvents');
                    //     event.initEvent('click', true, true);
                    //     pom.dispatchEvent(event);
                    // }
                }
            })
            .catch(e => {
                alert(e);
            });
        };
        reader.onerror = function (error) {
            alert(error);
        };
    } else {
        alert('Debe seleccionar un archivo.');
    }
};

const guardarEnServidor = (base64pdf, filename) => {
    console.log(base64pdf)
    console.log(filename)
    // const byteCharacters = atob(base64pdf);
    // const byteNumbers = new Array(byteCharacters.length);
    // for (let i = 0; i < byteCharacters.length; i++) {
    //     byteNumbers[i] = byteCharacters.charCodeAt(i);
    // }
    // const byteArray = new Uint8Array(byteNumbers);
    // const archivoBlob = new Blob([byteArray], { type: 'application/pdf' });

    // const archivoFile = new File([archivoBlob], filename, { type: 'application/pdf' });

    // const formData = new FormData();
    // formData.append('file', archivoFile);
    // formData.append('nombre', filename);
    // formData.append('nrotramite', '12345'); // Ajusta estos valores según tus necesidades
    // formData.append('flujo', 'abcde'); // Ajusta estos valores según tus necesidades
    // formData.append('tabla', 'documentos'); // Ajusta estos valores según tus necesidades

    // try {
    //     documentService.guardarDocumentos(formData);
    // } catch (error) {
    //     throw new Error('Error al guardar el archivo descargado: ' + error);
    // }
};

</script>

<style>
body {
    padding: 0;
    margin: 0;
    background: #b2b6c9;
}

.navbar {
    background: #6ab446;
}

.nav-link,
.navbar-brand {
    color: #fff;
    cursor: pointer;
}

.nav-link {
    margin-right: 1em !important;
}

.nav-link:hover {
    color: #000;
}

.navbar-collapse {
    justify-content: flex-end;
}

.description {
    left: 50%;
    position: absolute;
    top: 45%;
    transform: translate(-50%, -55%);
    text-align: center;
}

.description h1 {
    color: #6ab446;
}

.description p {
    color: #fff;
    font-size: 1.3rem;
    line-height: 1.5;
}

.features {
    margin: 4em auto;
    padding: 1em;
    position: relative;
}

.feature-title {
    color: #333;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-transform: uppercase;
}
</style>
