// Demo data generator: creates a handful of login-ready users and 50 sneaker
// products (each with a real photo URL) directly in MongoDB.
// Run with: npm run seed:demo
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const DEMO_PASSWORD = 'Password123!';

const DEMO_USERS = [
  { name: 'Sami Ben Ali', email: 'sami@snaekershub.com' },
  { name: 'Nour Trabelsi', email: 'nour@snaekershub.com' },
  { name: 'Yassine Gharbi', email: 'yassine@snaekershub.com' },
  { name: 'Amira Cherif', email: 'amira@snaekershub.com' },
  { name: 'Admin Demo', email: 'admin@snaekershub.com', role: 'admin' },
];

const BRANDS = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Converse', 'Vans', 'Asics', 'Under Armour', 'Jordan'];
const MODELS = [
  'Air Max 90', 'Air Force 1', 'Ultraboost 22', 'Suede Classic', '574 Core',
  'Club C 85', 'Chuck Taylor All Star', 'Old Skool', 'Gel-Kayano 29', 'HOVR Phantom',
  'React Infinity', 'Stan Smith', 'RS-X', '990v5', 'Zoom Pegasus 40',
  'Superstar', 'Cali', 'Sk8-Hi', 'Nimbus 25', 'Curry Flow',
];
const COLORS = ['Black/White', 'Triple White', 'Core Black', 'Grey/Blue', 'Red/Black', 'All White', 'Navy', 'Beige', 'Neon Green', 'Pastel Pink'];
const STORES = ['Store A - Tunis Centre', 'Store B - Lac 1', 'Store C - Sousse', 'Store D - Sfax', 'Store E - Online'];

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildSneakers(count) {
  const products = [];
  for (let i = 0; i < count; i += 1) {
    const brand = pick(BRANDS, i);
    const model = pick(MODELS, Math.floor(i / BRANDS.length) + i);
    const color = pick(COLORS, i);
    const name = `${brand} ${model} - ${color}`;
    const price = Number((45 + ((i * 37) % 260)).toFixed(2)); // spread between $45 and $305
    const stock = 5 + ((i * 13) % 46); // between 5 and 50
    products.push({
      name,
      description: `${brand} ${model} sneaker in ${color} colorway. Comfortable everyday wear.`,
      price,
      image: `https://picsum.photos/seed/snaekershub-${i + 1}/600/600`,
      storeLocation: pick(STORES, i),
      category: 'sneakers',
      stock,
    });
  }
  return products;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const createdUsers = [];

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[seed:demo] User already exists, skipping: ${u.email}`);
      createdUsers.push(existing);
      continue;
    }
    const user = await User.create({
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role || 'customer',
    });
    await Cart.create({ user: user._id, items: [] });
    createdUsers.push(user);
    console.log(`[seed:demo] Created user: ${u.email} / password: ${DEMO_PASSWORD}`);
  }

  return createdUsers;
}

async function seedProducts(ownerId, count) {
  const sneakers = buildSneakers(count);
  let created = 0;
  let skipped = 0;

  for (const s of sneakers) {
    const existing = await Product.findOne({ name: s.name });
    if (existing) {
      skipped += 1;
      continue;
    }
    await Product.create({ ...s, createdBy: ownerId });
    created += 1;
  }

  console.log(`[seed:demo] Products created: ${created}, skipped (already existed): ${skipped}`);
}

async function run() {
  await connectDB();

  const users = await seedUsers();
  await seedProducts(users[0]._id, 50);

  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  console.log(`[seed:demo] Done. Database now has ${totalUsers} user(s) and ${totalProducts} product(s).`);
  console.log('[seed:demo] Login with any of these emails and the password:', DEMO_PASSWORD);
  DEMO_USERS.forEach((u) => console.log(`  - ${u.email}`));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed:demo] Failed:', err);
  process.exit(1);
});
