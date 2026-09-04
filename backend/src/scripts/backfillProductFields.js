// One-off migration: the Product schema gained `brand`, `compareAtPrice` and
// `featured` after some demo products already existed in the database. This
// backfills those fields on any product that doesn't have a brand yet,
// instead of deleting and recreating documents (which would also orphan the
// order/favorite references that already point at them).
// Run with: node src/scripts/backfillProductFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Converse', 'Vans', 'Asics', 'Under Armour', 'Jordan'];
const CATEGORIES = ['basketball', 'running', 'lifestyle'];

function guessBrand(name) {
  return BRANDS.find((b) => name.startsWith(`${b} `)) || '';
}

async function run() {
  await connectDB();

  const products = await Product.find({ brand: { $in: [null, ''] } }).sort({ createdAt: 1 });
  let updated = 0;

  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    p.brand = guessBrand(p.name);
    if (p.category === 'sneakers' || !p.category) {
      p.category = CATEGORIES[i % CATEGORIES.length];
    }
    p.featured = i % 7 === 0;
    if (i % 4 === 0) {
      p.compareAtPrice = Number((p.price * 1.3).toFixed(2));
    }
    await p.save();
    updated += 1;
  }

  console.log(`[backfill] Updated ${updated} product(s) with brand/category/featured/compareAtPrice.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[backfill] Failed:', err);
  process.exit(1);
});
