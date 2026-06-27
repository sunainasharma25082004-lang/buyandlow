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

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false);
  }
};

const makeStorage = (dir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });

const productUpload = multer({
  storage: makeStorage(productUploadDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const reviewUpload = multer({
  storage: makeStorage(reviewUploadDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleUpload = (subdir) => (req, res, err, file) => {
  if (err) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be smaller than 5MB'
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
    filename: file.filename,
    size: file.size,
  });
};

router.post('/', protect, admin, uploadLimiter, (req, res) => {
  productUpload.single('image')(req, res, (err) =>
    handleUpload('products')(req, res, err, req.file),
  );
});

router.post('/review', protect, uploadLimiter, (req, res) => {
  reviewUpload.single('image')(req, res, (err) =>
    handleUpload('reviews')(req, res, err, req.file),
  );
});

export default router;