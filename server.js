const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testConnection } = require("./db");
const productsRoute = require("./products"); // این خط رو عوض کردم

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// مسیر درست برای فایل‌های استاتیک
app.use(express.static(__dirname)); // اینم عوض کردم

// routes
app.use("/api/products", productsRoute);

// main route - show home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // اینم عوض کردم
});

// admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html")); // اینم عوض کردم
});

// health check route
app.get("/health", async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🛍️ Shop is ready!`);
});
