// One-off script: migrates the legacy frontend products.json into MongoDB.
// Run with: npm run seed
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const legacyProducts = require(path.join(__dirname, '../../../frontend/products.json'));

async function seed() {
  await connectDB();

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`[seed] Products collection already has ${count} document(s). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const docs = legacyProducts.map((p) => ({
    name: p.name,
    price: Number(String(p.price).replace('$', '')),
    image: p.image || null,
    storeLocation: p.storeLocation || '',
    description: p.description || '',
    category: 'sneakers',
    stock: 20,
  }));

  const created = await Product.insertMany(docs);
  console.log(`[seed] Inserted ${created.length} product(s) into MongoDB.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
