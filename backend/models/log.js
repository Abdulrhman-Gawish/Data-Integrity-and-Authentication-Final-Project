const mongoose = require("mongoose");
const { Schema } = mongoose;

const LogSchema = new Schema({
  action: { type: String, required: true }, 
  entity: { type: String, required: true }, 
  entityId: mongoose.Schema.Types.ObjectId, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  userDetails: Object,
  details: Object, 
  ipAddress: String, 
  userAgent: String, 
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", LogSchema);
module.exports = Log;
