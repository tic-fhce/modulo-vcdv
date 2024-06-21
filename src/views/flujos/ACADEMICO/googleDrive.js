import googleDriveService from '@/services/googleDrive.service'
import documentService from '@/services/document.service';

export async function uploadFile(f, p) {
    const datos = { fileName: f, parametro: p };
    const response = await googleDriveService.cargarDocumento(datos);
    return response.data.fileId;
}

export async function share(cod) {
    const response = await googleDriveService.urlDocumento(cod.data)
    return response.data;
}

export async function download(cod, nomdoc, nrotramite, flujo, tabla) {
    const dat = { fileId: cod.data };
    const response = await googleDriveService.recuperarDocumento(dat);
    const archivoBlob = new Blob([response.data], { type: response.headers['content-type'] });

    // Crea un objeto File a partir del Blob
    const archivoFile = new File([archivoBlob], "extraido.pdf", {
        type: archivoBlob.type,
    });

    const formData = new FormData();
    formData.append('file', archivoFile);
    formData.append('nombre', nomdoc);
    formData.append('nrotramite', nrotramite);
    formData.append('flujo', flujo);
    formData.append('tabla', tabla);

    try {
        await documentService.guardarDocumentos(formData);
    } catch (error) {
        throw new Error('Error al guardar el archivo descargado: ' + error);
    }
}
