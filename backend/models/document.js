const mongoose = require("mongoose");
const { Schema } = mongoose;
const DocumentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },

  encryptedData: {
    type: Buffer,
    required: true,
  },
  iv: {
    type: Buffer,
    required: true,
  },
  encryptedKey: {
    type: String,
    required: true,
  },

  sha256Hash: {
    type: String,
    required: true,
  },
  digitalSignature: {
    type: String,
  },
  publicKeyFingerprint: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;
