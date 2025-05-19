const crypto = require("crypto");
const mongoose = require("mongoose");
const {
  createDocumentSignature,
  verifyDocumentSignature,
} = require("../utils/signDocument");
const Document = require("../models/document");
const AppError = require("../utils/appError");
const Log = require("../models/log");
const {
  setDownloadHeaders,
  verifyDocumentIntegrity,
} = require("../utils/helper");
const {
  decrypt,
  decryptKey,
  encrypt,
  encryptKey,
  generateHash,
} = require("../utils/crypto");

const masterKey = crypto
  .createHash("sha256")
  .update(process.env.MASTER_KEY)
  .digest();

/**
 * @desc    Upload a new encrypted document with digital signature
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      next(new AppError("No file uploaded", 400));
    }

    const { buffer, originalname: fileName, mimetype, size } = file;
    const sha256Hash = generateHash(buffer);
    const { signature, keyFingerprint } = createDocumentSignature(buffer);

    const aesKey = crypto.randomBytes(32);
    const { encrypted: encryptedData, iv } = encrypt(buffer, aesKey);
    const encryptedKey = encryptKey(aesKey, masterKey);

    const document = await Document.create({
      userId: req.userId,
      originalName: fileName,
      mimeType: mimetype,
      encryptedData,
      iv,
      encryptedKey,
      sha256Hash,
      digitalSignature: signature,
      publicKeyFingerprint: keyFingerprint,
    });

    await Log.create({
      action: "UPLOAD",
      entity: "Document",
      userId: req.user._id,
      documentId: document._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      documentDetails: {
        fileName: fileName,
        mimeType: mimetype,
        size: size,
        signatureVerified: true,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      data: {
        id: document._id,
        name: document.originalName,
        hash: sha256Hash,
        signature: `${signature.slice(0, 16)}...`,
      },
    });
  } catch (error) {
    next(new AppError(`Upload failed: ${error.message}`, 500));
  }
};

/**
 * @desc    Verify the digital signature of a document
 * @route   GET /api/documents/:id/verify
 * @access  Private
 * @param   {string} id - Document ID
 * @returns {Object} Verification status and document metadata
 */
const verifyDocumentSignaturee = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid document ID format", 400));
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).select("+encryptedKey +iv +encryptedData +sha256Hash +digitalSignature");

    if (!document) {
      return next(new AppError("Document not found or access denied", 404));
    }

    if (
      !document.encryptedKey ||
      !document.iv ||
      !document.encryptedData ||
      !document.sha256Hash ||
      !document.digitalSignature
    ) {
      return next(
        new AppError("Document missing required verification data", 400)
      );
    }

    try {
      const aesKey = decryptKey(document.encryptedKey, masterKey);
      const decryptedData = decrypt(
        document.encryptedData,
        aesKey,
        document.iv
      );

      verifyDocumentIntegrity(decryptedData, document.sha256Hash);

      const isSignatureValid = verifyDocumentSignature(
        decryptedData,
        document.digitalSignature
      );

      if (isSignatureValid) {
        res.status(200).json({
          status: "success",
          message: "Document signature verified successfully",
          data: {
            documentId: document._id,
            documentName: document.name,
            documentType: document.type,
            uploadedAt: document.createdAt,
            verifiedAt: new Date(),
            verificationResult: {
              integrity: true,
              authenticity: true,
              nonRepudiation: true,
            },
          },
        });
      } else {
        res.status(200).json({
          status: "success",
          message: "Document verification completed with issues",
          data: {
            documentId: document._id,
            verifiedAt: new Date(),
            verificationResult: {
              integrity: true, // Assuming integrity passed since we got here
              authenticity: false,
              nonRepudiation: false,
            },
            warning:
              "The document content is valid but the signature verification failed",
          },
        });
      }
    } catch (cryptoError) {
      if (cryptoError.name === "IntegrityError") {
        return next(
          new AppError(
            "Document integrity check failed - content may have been tampered with",
            400
          )
        );
      }
      return next(new AppError("Document verification processing error", 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download and decrypt a previously uploaded document with signature verification
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!document) {
      next(new AppError("File not found", 404));
    }

    const aesKey = decryptKey(document.encryptedKey, masterKey);
    const decryptedData = decrypt(document.encryptedData, aesKey, document.iv);

    verifyDocumentIntegrity(decryptedData, document.sha256Hash);

    const isSignatureValid = verifyDocumentSignature(
      decryptedData,
      document.digitalSignature
    );

    console.log(isSignatureValid);

    if (!isSignatureValid) {
      await Log.create({
        action: "DOWNLOAD_VERIFICATION_FAILED",
        entity: "Document",
        userId: req.user._id,
        documentId: document._id,
        userDetails: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        documentDetails: {
          fileName: document.originalName,
          mimeType: document.mimeType,
          signatureVerified: true,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      throw new AppError("Document signature verification failed", 403);
    }

    await Log.create({
      action: "DOWNLOAD",
      entity: "Document",
      userId: req.user._id,
      documentId: document._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      documentDetails: {
        fileName: document.originalName,
        mimeType: document.mimeType,
        signatureVerified: true,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    setDownloadHeaders(res, document.mimeType, document.originalName);
    res.status(200).send(Buffer.from(decryptedData));
  } catch (error) {
    next(new AppError(`Download failed: ${error.message}`, 500));
  }
};

/**
 * @desc    Get all documents for the authenticated user
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select(
        "_id originalName createdAt mimeType digitalSignature publicKeyFingerprint"
      )
      .sort({ createdAt: -1 })
      .lean();

    await Log.create({
      action: "READ_ALL",
      entity: "Document",
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    if (!documents.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No documents found for this user",
      });
    }

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(new AppError("Failed to retrieve documents: " + error.message, 500));
  }
};

/**
 * @desc    Update document metadata
 * @route   PATCH /api/documents/:id
 * @access  Private
 */
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalName } = req.body;

    if (!originalName?.trim()) {
      throw new AppError("Document name is required", 400);
    }

    const updatedDocument = await Document.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { originalName: originalName.trim() },
      { new: true, runValidators: true }
    ).select("_id originalName updatedAt mimeType");

    if (!updatedDocument) {
      throw new AppError("Document not found or unauthorized", 404);
    }

    await Log.create({
      action: "UPDATE",
      entity: "Document",
      userId: req.user._id,
      documentId: updatedDocument._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      documentDetails: {
        fileName: updatedDocument.originalName,
        mimeType: updatedDocument.mimeType,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      data: updatedDocument,
    });
  } catch (error) {
    next(
      new AppError(`Update failed: ${error.message}`, error.statusCode || 500)
    );
  }
};

/**
 * @desc    Delete a document
 * @route   DELETE /api/documents/:docId
 * @access  Private
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await Document.findOneAndDelete({
      _id: docId,
      userId: req.userId,
    });

    if (!document) {
      throw new AppError("Document not found or unauthorized", 404);
    }

    await Log.create({
      action: "DELETE",
      entity: "Document",
      userId: req.user._id,
      documentId: docId,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      documentDetails: {
        fileName: document.originalName,
        mimeType: document.mimeType,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(204).end();
  } catch (error) {
    next(
      new AppError(`Deletion failed: ${error.message}`, error.statusCode || 500)
    );
  }
};
module.exports = {
  uploadDocument,
  downloadDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  verifyDocumentSignaturee,
};
