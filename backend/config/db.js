<<<<<<< HEAD
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://127.0.0.1');

    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.log('   Make sure MongoDB is running and MONGODB_URI is correct');
    process.exit(1);
  }
=======
const mongoose = require('mongoose');

const connectDB = async () => {
  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(tryConnect, 5000);
    }
  };
  await tryConnect();
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
};

export default connectDB;
