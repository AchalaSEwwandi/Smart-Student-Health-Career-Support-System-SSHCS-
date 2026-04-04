const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Shop.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ role: { $in: ['delivery', 'vendor'] } });

  // Create delivery person
  const hashedPass = await bcrypt.hash('password123', 10);
  const deliveryPerson = await User.create({
    name: 'Kamal Perera',
    email: 'kamal@delivery.com',
    password: hashedPass,
    role: 'delivery',
    phone: '0771234567',
  });

  // Create shops
  const shops = await Shop.insertMany([
    { name: 'Cargils', description: 'Leading supermarket chain', location: 'Main Campus, Block A' },
    { name: 'Abenayaka Stores', description: 'Fresh groceries & essentials', location: 'Campus Gate 2' },
    { name: 'Dewnini Stores', description: 'Variety store for daily needs', location: 'Student Area, Block C' },
  ]);

  const [cargils, abenayaka, dewnini] = shops;

  // Create products for Cargils
  await Product.insertMany([
    { name: 'Milk (1L)', description: 'Fresh pasteurized milk', price: 85, category: 'Dairy', shop: cargils._id },
    { name: 'Bread (Loaf)', description: 'Soft white bread', price: 120, category: 'Bakery', shop: cargils._id },
    { name: 'Rice (1kg)', description: 'Premium basmati rice', price: 280, category: 'Grains', shop: cargils._id },
    { name: 'Eggs (10 pcs)', description: 'Farm fresh eggs', price: 350, category: 'Protein', shop: cargils._id },
    { name: 'Butter (200g)', description: 'Creamy salted butter', price: 190, category: 'Dairy', shop: cargils._id },
    { name: 'Orange Juice (500ml)', description: 'Fresh squeezed OJ', price: 155, category: 'Beverages', shop: cargils._id },
  ]);

  // Create products for Abenayaka
  await Product.insertMany([
    { name: 'Sugar (1kg)', description: 'White refined sugar', price: 175, category: 'Essentials', shop: abenayaka._id },
    { name: 'Coconut Oil (500ml)', description: 'Pure coconut oil', price: 320, category: 'Cooking', shop: abenayaka._id },
    { name: 'Dhal (500g)', description: 'Red lentils', price: 180, category: 'Protein', shop: abenayaka._id },
    { name: 'Noodles (Pack)', description: 'Instant noodles', price: 75, category: 'Dry Food', shop: abenayaka._id },
    { name: 'Tomato Sauce (Bottle)', description: 'Rich tomato sauce', price: 140, category: 'Sauces', shop: abenayaka._id },
    { name: 'Tea (100g)', description: 'Ceylon black tea', price: 220, category: 'Beverages', shop: abenayaka._id },
  ]);

  // Create products for Dewnini
  await Product.insertMany([
    { name: 'Soap Bar', description: 'Moisturizing soap', price: 60, category: 'Personal Care', shop: dewnini._id },
    { name: 'Shampoo (200ml)', description: 'Herbal shampoo', price: 180, category: 'Personal Care', shop: dewnini._id },
    { name: 'Toothpaste', description: 'Whitening toothpaste', price: 95, category: 'Personal Care', shop: dewnini._id },
    { name: 'Pen (Pack of 5)', description: 'Blue ballpoint pens', price: 55, category: 'Stationery', shop: dewnini._id },
    { name: 'Notebook', description: 'A4 ruled notebook', price: 145, category: 'Stationery', shop: dewnini._id },
    { name: 'Hand Sanitizer (100ml)', description: 'Antibacterial gel', price: 110, category: 'Health', shop: dewnini._id },
  ]);

  console.log('✅ Seed data inserted successfully!');
  console.log(`Shops: ${shops.map((s) => s.name).join(', ')}`);
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
