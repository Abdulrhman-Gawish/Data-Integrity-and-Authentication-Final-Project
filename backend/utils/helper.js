const Log = require("../models/log");
const { generateHash } = require("../utils/crypto");
const createLogEntry = async ({
  action,
  documentId,
  userId,
  user,
  fileDetails,
  req,
}) => {
  await Log.create({
    action,
    entity: "Document",
    entityId: documentId,
    userId,
    userDetails: {
      username: user.name,
      email: user.email,
    },
    details: {
      fileName: fileDetails.fileName,
      ...(fileDetails.size && { fileSize: fileDetails.size }),
      mimeType: fileDetails.mimetype,
    },
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  });
};

const verifyDocumentIntegrity = (decryptedData, storedHash) => {
  const currentHash = generateHash(decryptedData);
  if (currentHash !== storedHash) {
    throw new AppError("File integrity check failed", 500);
  }
};

const setDownloadHeaders = (res, mimeType, fileName) => {
  res.set({
    "Content-Type": mimeType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
  });
};

module.exports = {
  createLogEntry,
  setDownloadHeaders,
  verifyDocumentIntegrity,
};
