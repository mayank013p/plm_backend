const pool = require('../config/index.js'); // pg Pool
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function generateUsername(firstName = 'user') {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${firstName.toLowerCase()}_${suffix}`;
}

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      display_name = first_name,
      phone,
      education_level,
      field_of_study,
      bio,
      profile_picture
    } = req.body;

    // 1. Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Encrypt password
    const encryptedPassword = encrypt(password);

    // 3. Generate unique username
    let username = generateUsername(first_name);
    let attempt = 0;

    while (attempt < 5) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 LIMIT 1',
        [username]
      );

      if (usernameCheck.rows.length === 0) break;
      username = generateUsername(first_name);
      attempt++;
    }

    if (attempt === 5) {
      return res.status(500).json({ message: 'Could not generate unique username' });
    }

    // 4. Insert user into DB
    const insertQuery = `
      INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        display_name, phone, education_level, field_of_study,
        bio, profile_picture,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11,
        NOW(), NOW()
      )
      RETURNING id, username, email
    `;

    const values = [
      username,
      email,
      encryptedPassword,
      first_name,
      last_name,
      display_name,
      phone,
      education_level,
      field_of_study,
      bio,
      profile_picture || null
    ];
    console.log('Received register payload:', req.body);

    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    // 5. Generate JWT
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // 2. Decrypt and compare password
    let storedPassword;
    try {
      storedPassword = decrypt(user.password_hash);
    } catch (err) {
      return res.status(500).json({ message: 'Error decrypting password' });
    }

    if (storedPassword !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
