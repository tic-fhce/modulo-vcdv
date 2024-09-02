import alumnoLibreService from '@/services/alumnoLibre.service';
import { uploadFile, share, download } from '../../../googleDrive'

export async function handleUpload(nomdoc, nrotramite, colum) {
  try {
    const fileId = await uploadFile(nomdoc, nrotramite);
    const dat = { 'colum': colum, 'param': fileId, 'nrotramite': nrotramite }
    await alumnoLibreService.actulizarColumna(dat);
    return 'Carga de documento correcta a Google Drive'
  } catch (error) {
    return 'Error al subir archivo: ' + error.message;
  }
}

export async function handleUrl(nrotramite, colum){
    try{
        const dat = { 'nrotramite': nrotramite, 'columna': colum };
        const cod = await alumnoLibreService.obtenerColumna(dat);
        const res = await share(cod);
        return res.webViewLink
    } catch (error) {
        return 'Error al obtener la url: ' + error.message;
    }
}

export async function handleDownload(nrotramite, colum, nomdoc, flujo, tabla){
    try{
        const dat = { 'nrotramite': nrotramite, 'columna': colum };
        const cod = await alumnoLibreService.obtenerColumna(dat);
        const res = await download(cod, nomdoc, nrotramite, flujo, tabla);
        return "Descarga de documento correcta"
    } catch (error) {
        return'Error al obtener la url: ' + error.message
    }
}