const mongoose = require("mongoose");

const adminAuditSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  entity: String,
  meta: Object,
}, { timestamps: true });

module.exports = mongoose.models.AdminAudit || mongoose.model("AdminAudit", adminAuditSchema);
