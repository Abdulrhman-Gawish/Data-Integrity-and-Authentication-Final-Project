const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS_DIRECTORY = path.join(__dirname, '..', 'config');
const KEY_VALIDATION = {
  private: 'PRIVATE KEY',
  public: 'PUBLIC KEY'
};

function loadKey(filename, type) {
  const keyPath = path.join(KEYS_DIRECTORY, filename);
  
  try {
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Key file not found: ${filename}`);
    }

    const key = fs.readFileSync(keyPath, 'utf8').trim();
    
    if (!key.includes(KEY_VALIDATION[type])) {
      throw new Error(`Invalid ${type} key format`);
    }
    
    return key;
  } catch (error) {
    throw new Error(`Failed to load ${type} key: ${error.message}`);
  }
}

function getKeyFingerprint(key) {
  return crypto.createHash('sha256')
    .update(key)
    .digest('hex')
    .slice(0, 16);
}

module.exports = {
  privateKey: loadKey('private_key.pem', 'private'),
  publicKey: loadKey('public_key.pem', 'public'),
  getKeyFingerprint
};