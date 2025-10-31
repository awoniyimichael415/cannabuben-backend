const mongoose = require("mongoose");

const adminAuditSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true }, // e.g. "user", "reward", "card"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object }, // metadata like { before, after, ip }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AdminAudit || mongoose.model("AdminAudit", adminAuditSchema);
