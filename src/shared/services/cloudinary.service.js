/**
 * Cloudinary Service - Upload de imágenes para propiedades
 * Configuración: Unsigned upload preset
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'dnyimnfem',
    uploadPreset: 'urbania360_properties',
    folder: 'properties'
};

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen a subir
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onProgress - Callback para progreso (0-100)
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export const uploadImage = async (file, options = {}) => {
    const { onProgress } = options;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten: JPEG, PNG, GIF, WebP');
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('El archivo es muy grande. Tamaño máximo: 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progreso de subida
        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        url: response.secure_url,
                        publicId: response.public_id,
                        width: response.width,
                        height: response.height,
                        format: response.format,
                        bytes: response.bytes
                    });
                } catch (e) {
                    reject(new Error('Error procesando respuesta de Cloudinary'));
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.error?.message || 'Error subiendo imagen'));
                } catch (e) {
                    reject(new Error('Error subiendo imagen a Cloudinary'));
                }
            }
        };

        xhr.onerror = () => {
            reject(new Error('Error de conexión al subir imagen'));
        };

        xhr.open('POST', CLOUDINARY_UPLOAD_URL);
        xhr.send(formData);
    });
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {File[]} files - Array de archivos de imagen
 * @param {Object} options - Opciones adicionales
 * @param {number} options.maxImages - Número máximo de imágenes (default: 5)
 * @param {Function} options.onFileProgress - Callback (fileIndex, progress)
 * @param {Function} options.onFileComplete - Callback (fileIndex, result)
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
export const uploadMultipleImages = async (files, options = {}) => {
    const { maxImages = 5, onFileProgress, onFileComplete } = options;

    if (files.length > maxImages) {
        throw new Error(`Máximo ${maxImages} imágenes permitidas`);
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
        try {
            const result = await uploadImage(files[i], {
                onProgress: (progress) => {
                    if (onFileProgress) onFileProgress(i, progress);
                }
            });
            results.push(result);
            if (onFileComplete) onFileComplete(i, { success: true, result });
        } catch (error) {
            errors.push({ index: i, fileName: files[i].name, error: error.message });
            if (onFileComplete) onFileComplete(i, { success: false, error: error.message });
        }
    }

    if (errors.length > 0 && results.length === 0) {
        throw new Error(`Error subiendo todas las imágenes: ${errors.map(e => e.error).join(', ')}`);
    }

    return {
        uploaded: results,
        errors: errors
    };
};

/**
 * Genera URL optimizada para thumbnail
 * @param {string} url - URL original de Cloudinary
 * @param {number} width - Ancho deseado
 * @param {number} height - Alto deseado
 * @returns {string} URL transformada
 */
export const getThumbnailUrl = (url, width = 300, height = 200) => {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }
    
    // Insertar transformaciones en la URL
    const parts = url.split('/upload/');
    if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${parts[1]}`;
    }
    return url;
};

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Tipo de archivo no válido' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Archivo muy grande (máx. 10MB)' };
    }

    return { valid: true };
};

export default {
    uploadImage,
    uploadMultipleImages,
    getThumbnailUrl,
    validateImageFile
};
