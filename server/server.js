import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import seedCategoriesIfEmpty from './utils/seedCategories.js';
import { validateEnv, getCorsOrigins, isLocalDevOrigin, isProduction } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import supportRoutes from './routes/support.js';
import appRoutes from './routes/app.js';

dotenv.config();
validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

const corsOrigins = getCorsOrigins();
if (isProduction && corsOrigins.length) {
  console.log(`🌐 CORS allowed origins: ${corsOrigins.join(', ')}`);
}
app.use(cors({
  origin: (origin, callback) => {
    const normalized = origin ? origin.replace(/\/+$/, '') : origin;

    if (!normalized) {
      callback(null, true);
      return;
    }

    if (!isProduction && isLocalDevOrigin(normalized)) {
      callback(null, true);
      return;
    }

    if (corsOrigins.length === 0 || corsOrigins.includes(normalized)) {
      callback(null, true);
      return;
    }

    console.warn(`⚠️  CORS blocked for origin: ${normalized}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Bypass-Tunnel-Reminder',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 204,
}));

app.options('*', cors());

app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: isProduction ? '7d' : 0,
}));

app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: global.isDbConnected ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/app', appRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/upload', uploadRoutes);

// Optional: serve client build from the same service (single-service deploy).
// For Render 3-service setup keep SERVE_CLIENT=false (default).
if (isProduction && process.env.SERVE_CLIENT === 'true') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath, { maxAge: '1d' }));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedCategoriesIfEmpty();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BuyLow API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📱 Phone se connect: http://<your-wifi-ip>:${PORT}/api`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    if (isProduction) shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
};

startServer();