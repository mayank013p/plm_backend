const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const ivLength = 16;

// Secure key generation (ensure 32 bytes)
const keyString = process.env.ENCRYPTION_SECRET || 'default_key_that_is_32_bytes_long!';
const secretKey = crypto.createHash('sha256').update(keyString).digest().slice(0, 32);

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
