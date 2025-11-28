// db.js - نسخه JSON (بدون نیاز به دیتابیس)
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'products.json');

// ایجاد فایل اگر وجود ندارد
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '[]');
  console.log('✅ Created products.json file');
}

// خواندن محصولات از فایل JSON
function getProducts() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
}

// ذخیره محصولات در فایل JSON
function saveProducts(products) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(products, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
}

// شبیه‌سازی MySQL interface برای سازگاری
const db = {
  query: async (sql, params = []) => {
    console.log('📦 Executing:', sql);
    
    if (sql.includes('SELECT')) {
      let products = getProducts();
      
      // ORDER BY id DESC
      if (sql.includes('ORDER BY id DESC')) {
        products = products.sort((a, b) => b.id - a.id);
      }
      
      // WHERE id = ?
      if (sql.includes('WHERE id = ?')) {
        const id = parseInt(params[0]);
        products = products.filter(p => p.id === id);
      }
      
      return [products];
    }
    
    // INSERT INTO
    if (sql.includes('INSERT INTO')) {
      const products = getProducts();
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      
      const newProduct = {
        id: newId,
        title: params[0] || '',
        description: params[1] || '',
        price: parseInt(params[2]) || 0,
        image_url: params[3] || '',
        link_to_buy: params[4] || '',
        created_at: new Date().toISOString()
      };
      
      products.push(newProduct);
      const success = saveProducts(products);
      
      if (success) {
        console.log('✅ Product added with ID:', newId);
        return [{ insertId: newId, affectedRows: 1 }];
      } else {
        throw new Error('Failed to save product');
      }
    }
    
    // DELETE FROM
    if (sql.includes('DELETE FROM')) {
      const products = getProducts();
      const id = parseInt(params[0]);
      const initialLength = products.length;
      
      const filteredProducts = products.filter(p => p.id !== id);
      const success = saveProducts(filteredProducts);
      
      if (success) {
        const affectedRows = initialLength - filteredProducts.length;
        console.log('✅ Product deleted, affected rows:', affectedRows);
        return [{ affectedRows }];
      } else {
        throw new Error('Failed to delete product');
      }
    }
    
    // UPDATE
    if (sql.includes('UPDATE')) {
      const products = getProducts();
      const id = parseInt(params[5]); // آخرین پارامتر
      
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          title: params[0] || products[productIndex].title,
          description: params[1] || products[productIndex].description,
          price: parseInt(params[2]) || products[productIndex].price,
          image_url: params[3] || products[productIndex].image_url,
          link_to_buy: params[4] || products[productIndex].link_to_buy
        };
        
        const success = saveProducts(products);
        if (success) {
          return [{ affectedRows: 1 }];
        }
      }
      return [{ affectedRows: 0 }];
    }
    
    return [{ affectedRows: 0 }];
  }
};

// تست اتصال
async function testConnection() {
  console.log('✅ Connected to JSON database successfully');
  return true;
}

module.exports = {
  pool: db,
  testConnection
};
