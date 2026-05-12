const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    topic_name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

topicSchema.index({ chapter_id: 1, topic_name: 1 }, { unique: true });
topicSchema.index({ topic_name: "text" });

module.exports = mongoose.model("Topic", topicSchema);
