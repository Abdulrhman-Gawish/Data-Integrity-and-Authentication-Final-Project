const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');


/**
 * @desc Optionally to store large files 
 */
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents'  
  });
});

const uploadToGridFS = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gfs.openUploadStream(filename);
    const fileId = uploadStream.id;
    uploadStream.write(fileBuffer);
    uploadStream.end(() => resolve(fileId));
  });
};

const downloadFromGridFS = (fileId) => {
  return gfs.openDownloadStream(fileId);
};

module.exports = { uploadToGridFS, downloadFromGridFS };