const crypto = require("crypto");

const generateHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const encrypt = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv };
};

const decrypt = (encryptedBuffer, key, iv) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

const encryptKey = (aesKey, masterKey) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    masterKey,
    Buffer.alloc(16)
  );
  return Buffer.concat([cipher.update(aesKey), cipher.final()]).toString(
    "base64"
  );
};

const decryptKey = (encryptedKey, masterKey) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    masterKey,
    Buffer.alloc(16)
  );
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedKey, "base64")),
    decipher.final(),
  ]);
};

module.exports = { generateHash, encrypt, decrypt, encryptKey, decryptKey };
