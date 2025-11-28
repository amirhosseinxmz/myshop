const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testConnection } = require("./db");
const productsRoute = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// routes
app.use("/api/products", productsRoute);

// main route - show home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
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
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.log('❌ Cannot start server without database connection');
    console.log('💡 Please make sure MySQL is running and database exists');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🛍️  Shop: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);