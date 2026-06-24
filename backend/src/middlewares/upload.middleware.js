const multer = require('multer');
const path   = require('path');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Almacenamiento en memoria para luego subir a Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter(req, file, cb) {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
    }
    cb(null, true);
  }
});

module.exports = { upload };
