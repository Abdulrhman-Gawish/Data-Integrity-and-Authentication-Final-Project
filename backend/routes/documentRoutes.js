const express = require("express");
const multer = require("multer");
const {
  uploadDocument,
  downloadDocument,
  getDocuments,
  deleteDocument,
  updateDocument,
  verifyDocumentSignaturee,
} = require("../controllers/documentController");
const auth = require("../middleware/verifyToken");

const uploadMiddleware = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Upload (POST /api/documents/upload)
router.post("/upload", auth, uploadMiddleware.single("file"), uploadDocument);

// GET (GET /api/documents)
router.get("/", auth, getDocuments);
router.delete("/:docId", auth, deleteDocument);
router.patch("/:id", auth, updateDocument);

// Download (GET /api/documents/:id/download)
router.get("/:id/download", auth, downloadDocument);

// Verify (GET /api/documents/:id/verify)
router.get("/:id/verify", auth, verifyDocumentSignaturee);

module.exports = router;
