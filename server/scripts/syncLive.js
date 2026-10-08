import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIVE_HOSTS = [
  'https://buylowindia.com',
  'https://buyandlow-api.onrender.com'
];

async function fetchFromLive(endpoint) {
  for (const host of LIVE_HOSTS) {
    try {
      const url = `${host}${endpoint}`;
      console.log(`Trying ${url}...`);
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json();
        return { data, host };
      }
    } catch (e) {
      console.warn(`Failed from ${host}: ${e.message}`);
    }
  }
  throw new Error(`Could not fetch ${endpoint} from any live host`);
}

async function downloadImageIfMissing(imageUrl, liveHost, uploadsDir) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  const localRelative = imageUrl.replace(/^\/uploads\//, '');
  const localFullPath = path.join(uploadsDir, localRelative);
  const dir = path.dirname(localFullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(localFullPath)) {
    return; // Already downloaded
  }

  try {
    const fullRemoteUrl = `${liveHost}${imageUrl}`;
    const res = await fetch(fullRemoteUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localFullPath, buffer);
      console.log(`  Downloaded: ${localRelative} (${Math.round(buffer.length / 1024)} KB)`);
    }
  } catch (e) {
    console.warn(`  Could not download ${imageUrl}: ${e.message}`);
  }
}

async function sync() {
  console.log('🔄 Fetching live products and categories from production...');

  const { data: prodData, host: prodHost } = await fetchFromLive('/api/products?limit=100');
  const { data: catData, host: catHost } = await fetchFromLive('/api/categories');

  const rawProducts = Array.isArray(prodData) ? prodData : (prodData.products || prodData.data || []);
  const rawCategories = catData.categories || catData.data || (Array.isArray(catData) ? catData : []);

  console.log(`✅ Fetched ${rawProducts.length} products from ${prodHost}`);
  console.log(`✅ Fetched ${rawCategories.length} categories from ${catHost}`);

  const uploadsDir = path.join(__dirname, '../uploads');

  console.log('📥 Syncing live product images to local storage...');
  for (const p of rawProducts) {
    const allImages = [
      p.image,
      ...(Array.isArray(p.images) ? p.images : [])
    ].filter(Boolean);

    for (const img of allImages) {
      await downloadImageIfMissing(img, prodHost, uploadsDir);
    }
  }

  for (const c of rawCategories) {
    if (c.image) {
      await downloadImageIfMissing(c.image, catHost, uploadsDir);
    }
  }

  // Clean products for static fallback
  const cleanProducts = rawProducts.map((p, idx) => ({
    id: p._id || `prod_${idx + 1}`,
    name: p.name,
    price: Number(p.price) || 0,
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    rating: Number(p.rating) || 4.5,
    reviews: Number(p.reviews) || 0,
    image: p.image || '',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    badge: p.badge || '',
    category: p.category || 'General',
    subcategory: p.subcategory || '',
    brand: p.brand || 'Truemart',
    sku: p.sku || `SKU-${idx + 1}`,
    stock: p.stock ?? 10,
    colors: p.colors || [],
    description: p.description || '',
    keyFeatures: p.keyFeatures || [],
    tags: p.tags || []
  }));

  // Clean categories
  const cleanCategories = rawCategories.map((c, idx) => ({
    name: c.name,
    title: c.title || c.displayName || c.name,
    image: c.image || '',
    description: c.description || '',
    subcategories: c.subcategories || [],
    sortOrder: c.sortOrder ?? idx,
    isActive: c.isActive !== false,
    showOnHome: c.showOnHome !== false
  }));

  const productsPath = path.join(__dirname, '../data/products.js');
  const categoriesPath = path.join(__dirname, '../data/categories.js');

  const timestamp = new Date().toISOString();
  const productsFileContent = `// Auto-synced from live production server ${prodHost} (${timestamp})\nexport const products = ${JSON.stringify(cleanProducts, null, 2)};\n`;
  const categoriesFileContent = `// Auto-synced from live production server ${catHost} (${timestamp})\nexport const defaultCategories = ${JSON.stringify(cleanCategories, null, 2)};\n`;

  fs.writeFileSync(productsPath, productsFileContent, 'utf-8');
  fs.writeFileSync(categoriesPath, categoriesFileContent, 'utf-8');

  console.log(`\n🎉 Successfully synced ${cleanProducts.length} live products to server/data/products.js`);
  console.log(`🎉 Successfully synced ${cleanCategories.length} live categories to server/data/categories.js`);
}

sync().catch(console.error);
