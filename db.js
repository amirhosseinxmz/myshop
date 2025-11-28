const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// مسیر دیتابیس - در Render از /tmp استفاده می‌کنیم
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/shop.db'
  : path.join(__dirname, 'shop.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initDatabase();
  }
});

// ایجاد جدول products
function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    image_url TEXT,
    link_to_buy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
    } else {
      console.log('✅ Products table ready');
    }
  });
}

// تابع برای اجرای query (شبیه mysql2)
db.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve([rows]);
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
      });
    }
  });
};

// Test database connection
async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ Connected to SQLite database successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  pool: db,
  testConnection
};
