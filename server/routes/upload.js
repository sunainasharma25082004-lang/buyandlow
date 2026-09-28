import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { getPublicBaseUrl } from '../utils/url.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productUploadDir = path.join(__dirname, '../uploads/products');
const reviewUploadDir = path.join(__dirname, '../uploads/reviews');

fs.mkdirSync(productUploadDir, { recursive: true });
fs.mkdirSync(reviewUploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

const makeStorage = (dir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.png';
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, safeName);
    },
  });

const productUpload = multer({
  storage: makeStorage(productUploadDir),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const reviewUpload = multer({
  storage: makeStorage(reviewUploadDir),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleUpload = (subdir) => (req, res, err, file) => {
  if (err) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be smaller than 10MB'
      : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (!file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const imagePath = `/uploads/${subdir}/${file.filename}`;
  const publicBase = getPublicBaseUrl(req);

  res.status(201).json({
    success: true,
    url: imagePath,
    fullUrl: `${publicBase}${imagePath}`,
    urls: [imagePath],
    fullUrls: [`${publicBase}${imagePath}`],
    filename: file.filename,
    size: file.size,
  });
};

const handleMultipleUpload = (subdir) => (req, res, err, files) => {
  if (err) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Each image must be smaller than 10MB'
      : err.message;
    return res.status(400).json({ success: false, message });
  }

  const fileList = Array.isArray(files) ? files : (files ? [files] : []);
  if (fileList.length === 0) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const publicBase = getPublicBaseUrl(req);
  const uploadedFiles = fileList.map((file) => {
    const imagePath = `/uploads/${subdir}/${file.filename}`;
    return {
      url: imagePath,
      fullUrl: `${publicBase}${imagePath}`,
      filename: file.filename,
      size: file.size,
    };
  });

  const urls = uploadedFiles.map((f) => f.url);
  const fullUrls = uploadedFiles.map((f) => f.fullUrl);

  return res.status(201).json({
    success: true,
    urls,
    fullUrls,
    files: uploadedFiles,
    url: urls[0],
    fullUrl: fullUrls[0],
    filename: uploadedFiles[0].filename,
    size: uploadedFiles[0].size,
  });
};

router.post('/multiple', protect, admin, uploadLimiter, (req, res) => {
  productUpload.array('images', 30)(req, res, (err) => {
    if (err) {
      return handleMultipleUpload('products')(req, res, err, null);
    }
    return handleMultipleUpload('products')(req, res, null, req.files);
  });
});

router.post('/', protect, admin, uploadLimiter, (req, res) => {
  productUpload.any()(req, res, (err) => {
    if (err) {
      return handleUpload('products')(req, res, err, null);
    }
    if (req.files && req.files.length > 1) {
      return handleMultipleUpload('products')(req, res, null, req.files);
    }
    const singleFile = req.files && req.files.length === 1 ? req.files[0] : null;
    return handleUpload('products')(req, res, null, singleFile);
  });
});

router.post('/review', protect, uploadLimiter, (req, res) => {
  reviewUpload.single('image')(req, res, (err) =>
    handleUpload('reviews')(req, res, err, req.file),
  );
});

export default router;