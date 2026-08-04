const mongoose = require("mongoose");

const bannedIdentifierSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    reason: { type: String, default: "Violation of Terms of Service" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BannedIdentifier", bannedIdentifierSchema);
