const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    isFree: { type: Boolean, default: true },
    subjects: [{ type: String }],
    languages: [{ type: String }],
    rating: { type: Number, default: 5.0 },
    responseTime: { type: Number, default: 30 }, // in seconds
    experience: { type: Number, default: 1 }, // in years
    verificationStatus: { 
      type: String, 
      enum: ["pending", "verified", "rejected"], 
      default: "pending" 
    },
    degreeUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  { timestamps: true }
);

teacherProfileSchema.index({ location: "2dsphere" });
teacherProfileSchema.index({ isOnline: 1, isFree: 1 });

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
