import apiAdsibService from '@/services/token.service';

export async function listarTokens() {
    try {
        const response = await apiAdsibService.ListarToken();
        if (response.data.finalizado) {
            return response.data.datos.tokens;
        } else {
            throw new Error('Error al detectar tokens.');
        }
    } catch (error) {
        throw error;
    }
}

export async function listarCertificados(pin, slot) {
    try {
        const datos = {
            pin: pin,
            slot: slot
        };
        const response = await apiAdsibService.ListarCertificados(datos);
        if (response.data.finalizado) {
            return response.data.datos.data_token.data.filter(
                (el) => el.tipo === 'X509_CERTIFICATE'
            );
        } else {
            throw new Error('Error al listar certificados.');
        }
    } catch (error) {
        throw error;
    }
}

export async function firmarDocumentosApi(datosFirma) {
    try {
        const signResponse = await apiAdsibService.FirmarDocumentos(datosFirma);
        if (signResponse.data.finalizado) {
            return signResponse.data.datos.pdfs_firmados;
        } else {
            throw new Error('Error al firmar los documentos.');
        }
    } catch (error) {
        throw error;
    }
}

export async function validarDocumento(pdfBase64) {
    try {
        const datos = {
            pdf: pdfBase64
        };
        const response = await apiAdsibService.ValidarDocumento(datos);
        if (response.data.finalizado) {
            return response.data.datos.firmas;
        } else {
            throw new Error('Error al validar el documento.');
        }
    } catch (error) {
        throw error;
    }
}