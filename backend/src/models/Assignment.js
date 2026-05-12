const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    dueDate: { type: Date, required: true },
    status: { type: String, default: "Pending", trim: true },
    subject: { type: String, default: "", trim: true },
    class_level: { type: String, default: "", trim: true },
    board: { type: String, default: "NCERT", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
