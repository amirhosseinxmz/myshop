const { pool } = require('./db');  // '../db' رو به './db' تغییر بده

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching products" });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching product" });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, image_url, link_to_buy } = req.body;

    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (title, description, price, image_url, link_to_buy) VALUES (?, ?, ?, ?, ?)",
      [title, description, parseInt(price), image_url, link_to_buy]
    );

    res.json({ 
      message: "Product added successfully", 
      id: result.insertId,
      success: true 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding product" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting product" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, image_url, link_to_buy } = req.body;
    const productId = req.params.id;

    const [result] = await pool.query(
      "UPDATE products SET title = ?, description = ?, price = ?, image_url = ?, link_to_buy = ? WHERE id = ?",
      [title, description, parseInt(price), image_url, link_to_buy, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating product" });
  }
};
