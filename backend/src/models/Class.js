const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    class_no: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true }
  },
  { timestamps: true }
);

classSchema.index({ board_id: 1, class_no: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
