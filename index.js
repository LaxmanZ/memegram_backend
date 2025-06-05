const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () => {
      console.log('🚀 Server running on http://localhost:5000');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

app.use('/api/auth', authRoutes);
