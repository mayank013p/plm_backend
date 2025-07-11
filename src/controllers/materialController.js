const { sequelize } = require('../models');

// 1. CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color } = req.body;

    const query = `
      INSERT INTO material_categories (user_id, name, color, created_at, updated_at)
      VALUES (:userId, :name, :color, NOW(), NOW())
      RETURNING id, name, color, user_id
    `;

    const [result] = await sequelize.query(query, {
      replacements: { userId, name, color },
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({ message: 'Category created successfully', category: result[0] });
  } catch (err) {
    console.error('Create Category Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. GET ALL CATEGORIES FOR USER
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `SELECT id, name, color FROM material_categories WHERE user_id = :userId ORDER BY id ASC`;

    const [results] = await sequelize.query(query, {
      replacements: { userId }
    });

    res.status(200).json({ categories: results });
  } catch (err) {
    console.error('Fetch Categories Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 3. UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name, color } = req.body;

    const query = `
      UPDATE material_categories
      SET name = :name, color = :color, updated_at = NOW()
      WHERE id = :categoryId AND user_id = :userId
    `;

    await sequelize.query(query, {
      replacements: { name, color, categoryId, userId }
    });

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error('Update Category Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 4. DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const query = `
      DELETE FROM material_categories
      WHERE id = :categoryId AND user_id = :userId
    `;

    await sequelize.query(query, {
      replacements: { categoryId, userId }
    });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete Category Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
