const { sequelize } = require('../models');

// 🔹 Create Goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title, progress, target,
      deadline, category, priority
    } = req.body;

    const query = `
      INSERT INTO goals (
        user_id, title, progress, target,
        deadline, category, priority, created_at, updated_at
      ) VALUES (
        :userId, :title, :progress, :target,
        :deadline, :category, :priority, NOW(), NOW()
      ) RETURNING *;
    `;

    const [result] = await sequelize.query(query, {
      replacements: {
        userId, title, progress : progress || null, target, deadline, category, priority
      },
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal: result[0]
    });
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Get All Goals for Logged-in User
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM goals
      WHERE user_id = :userId
      ORDER BY created_at DESC;
    `;

    const [goals] = await sequelize.query(query, {
      replacements: { userId }
    });

    res.status(200).json({ goals });
  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Update Goal by ID
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const {
      title, progress, target, deadline,
      category, priority
    } = req.body;

    const query = `
      UPDATE goals
      SET
        title = :title,
        progress = :progress,
        target = :target,
        deadline = :deadline,
        category = :category,
        priority = :priority,
        updated_at = NOW()
      WHERE id = :goalId AND user_id = :userId;
    `;

    await sequelize.query(query, {
      replacements: {
        goalId, userId, title, progress, target,
        deadline, category, priority
      }
    });

    res.status(200).json({ message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔹 Delete Goal by ID
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const query = `
      DELETE FROM goals
      WHERE id = :goalId AND user_id = :userId;
    `;

    await sequelize.query(query, {
      replacements: { goalId, userId }
    });

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
