const { sequelize } = require('../models');

exports.searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const searchQuery = req.query.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const users = await sequelize.query(
      `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.display_name, 
        u.profile_picture,
        CASE
          WHEN f.status = 'accepted' THEN 'accepted'
          WHEN f.status = 'pending' AND f.action_user_id = :userId THEN 'pending'
          ELSE 'none'
        END AS friendship_status
      FROM users u
      LEFT JOIN friendships f
        ON (
          (f.user_one_id = :userId AND f.user_two_id = u.id)
          OR
          (f.user_two_id = :userId AND f.user_one_id = u.id)
        )
      WHERE (
        LOWER(u.username) LIKE LOWER(:query) OR
        LOWER(u.display_name) LIKE LOWER(:query) OR
        LOWER(u.email) LIKE LOWER(:query)
      )
      AND u.id != :userId
      LIMIT :limit;
      `,
      {
        replacements: {
          query: `%${searchQuery}%`,
          userId,
          limit
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({ results: users });
  } catch (err) {
    console.error('Search Users Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



exports.sendFriendRequest = async (req, res) => {
  const fromUserId = req.user.id;
  const { to_username } = req.body;

  if (!to_username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // 1. Find recipient's user ID
    const [users] = await sequelize.query(
      `SELECT id FROM users WHERE username = :to_username`,
      { replacements: { to_username } }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const toUserId = users[0].id;

    if (toUserId === fromUserId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const userOneId = Math.min(fromUserId, toUserId);
    const userTwoId = Math.max(fromUserId, toUserId);

    // 2. Check if friendship already exists
    const [existing] = await sequelize.query(
      `SELECT id FROM friendships 
       WHERE user_one_id = :userOneId AND user_two_id = :userTwoId`,
      {
        replacements: { userOneId, userTwoId }
      }
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Friend request already exists or already friends' });
    }

    // 3. Create new friendship entry
    const [result] = await sequelize.query(
      `INSERT INTO friendships (
        user_one_id,
        user_two_id,
        status,
        action_user_id,
        created_at,
        updated_at
      ) VALUES (
        :userOneId,
        :userTwoId,
        'pending',
        :actionUserId,
        NOW(),
        NOW()
      ) RETURNING id`,
      {
        replacements: {
          userOneId,
          userTwoId,
          actionUserId: fromUserId
        }
      }
    );

    return res.status(201).json({
      message: 'Friend request sent successfully',
      friendship_id: result[0]?.id
    });

  } catch (error) {
    console.error('Send Friend Request Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getFriendRequests = async (req, res) => {
  const currentUserId = req.user.id;
  console.log("🔍 Fetching requests for user:", currentUserId);

  try {
    const [requests] = await sequelize.query(
      `
      SELECT 
        f.id AS friendship_id,
        u.id AS from_user_id,
        u.username,
        u.display_name,
        u.bio,
        u.profile_picture,
        f.created_at AS sent_at
      FROM friendships f
      JOIN users u ON u.id = f.action_user_id
      WHERE f.status = 'pending'
        AND (f.user_one_id = :currentUserId OR f.user_two_id = :currentUserId)
        AND f.action_user_id != :currentUserId
      ORDER BY f.created_at DESC
      `,
      {
        replacements: { currentUserId }
      }
    );

    console.log("✅ Found requests:", requests.length);
    return res.status(200).json({ requests });
  } catch (err) {
    console.error('❌ Fetch Friend Requests Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.respondToFriendRequest = async (req, res) => {
  const currentUserId = req.user?.id;
  const friendshipId = Number(req.params.id);
  const { action } = req.body;

  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Use 'accept' or 'decline'." });
  }

  if (!currentUserId || isNaN(friendshipId)) {
    return res.status(400).json({ message: 'Invalid or missing user or friendship ID' });
  }

  try {
    // Step 1: Fetch the friendship to validate ownership
    const [rows] = await sequelize.query(
      `
      SELECT * FROM friendships
      WHERE id = :friendshipId
        AND status = 'pending'
      `,
      { replacements: { friendshipId } }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found or already handled' });
    }

    const friendship = rows[0];

    // Validate: the current user must be the recipient (not the action initiator)
    if (friendship.action_user_id === currentUserId) {
      return res.status(403).json({ message: 'You cannot respond to your own friend request' });
    }

    if (action === 'accept') {
      // Step 2: Accept the request
      const [result] = await sequelize.query(
        `
        UPDATE friendships
        SET status = 'accepted', updated_at = NOW()
        WHERE id = :friendshipId
          AND status = 'pending'
        RETURNING id
        `,
        {
          replacements: { friendshipId }
        }
      );

      return res.status(200).json({ message: 'Friend request accepted successfully' });
    }

    // Step 3: Decline (delete)
    const [result] = await sequelize.query(
      `
      DELETE FROM friendships
      WHERE id = :friendshipId
        AND status = 'pending'
      RETURNING id
      `,
      {
        replacements: { friendshipId }
      }
    );

    return res.status(200).json({ message: 'Friend request declined and removed' });

  } catch (err) {
    console.error('Respond Friend Request Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFriends = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const [friends] = await sequelize.query(
      `
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.profile_picture,
        u.bio
      FROM friendships f
      JOIN users u
        ON (
          (u.id = f.user_one_id AND f.user_one_id != :currentUserId)
          OR (u.id = f.user_two_id AND f.user_two_id != :currentUserId)
        )
      WHERE 
        (f.user_one_id = :currentUserId OR f.user_two_id = :currentUserId)
        AND f.status = 'accepted'
      `,
      {
        replacements: { currentUserId }
      }
    );

    return res.status(200).json({ friends });
  } catch (err) {
    console.error('Fetch Friends Error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

