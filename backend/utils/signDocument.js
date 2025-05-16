const crypto = require('crypto');
const { privateKey, publicKey, getKeyFingerprint } = require('../config/key');

const SIGNING_CONFIG = {
  algorithm: 'SHA256',
  signatureFormat: 'base64'
};

function createDocumentSignature(buffer) {
  const signer = crypto.createSign(SIGNING_CONFIG.algorithm);
  signer.update(buffer);
  
  return {
    signature: signer.sign(privateKey, SIGNING_CONFIG.signatureFormat),
    keyFingerprint: getKeyFingerprint(publicKey)
  };
}

function verifyDocumentSignature(buffer, signature) {
  const verifier = crypto.createVerify(SIGNING_CONFIG.algorithm);
  verifier.update(buffer);
  return verifier.verify(publicKey, signature, SIGNING_CONFIG.signatureFormat);
}

module.exports = {
  createDocumentSignature,
  verifyDocumentSignature
};