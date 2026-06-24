const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Sube un buffer de imagen a Cloudinary.
 * @returns {string} URL pública de la imagen
 */
async function subirImagen(buffer, nombreArchivo) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:   'marisol/productos',
        public_id: `prod_${Date.now()}_${nombreArchivo}`.replace(/\s/g, '_'),
        overwrite: true,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function eliminarImagen(urlImagen) {
  if (!urlImagen) return;
  try {
    const publicId = urlImagen.split('/').slice(-2).join('/').replace(/\.\w+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch { /* no crítico */ }
}

module.exports = { subirImagen, eliminarImagen };
