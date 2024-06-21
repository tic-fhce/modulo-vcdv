<template>
    <div>
      <h2>Compress PDF</h2>
      <input type="file" @change="onFileChange" />
      <button @click="uploadFile">Upload and Compress</button>
      <a v-if="downloadUrl" :href="downloadUrl" download="compressed.pdf">Download Compressed PDF</a>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import documentService from '@/services/document.service';
  
  const file = ref(null);
  const downloadUrl = ref(null);
  
  const onFileChange = (event) => {
    file.value = event.target.files[0];
  };
  
  const uploadFile = async () => {
    if (!file.value) {
      alert('Please select a file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file.value);
  
    try {
      const res = await documentService.pdfcompress(formData)
      console.log(res)
    } catch (error) {
      console.error('There was an error uploading the file!', error);
    }
  };
  </script>
  
  <style scoped>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  input {
    margin: 10px 0;
  }
  
  button {
    margin: 10px 0;
  }
  </style>
  