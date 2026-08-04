const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const { hashPassword } = require("./password");

const seedDevUsers = async () => {
  try {
    const devUsers = [
      {
        name: "Demo Student",
        email: process.env.STUDENT_EMAIL || "student@eduai.com",
        password: process.env.STUDENT_PASSWORD || "student123",
        role: "student"
      },
      {
        name: "Demo Teacher",
        email: process.env.TEACHER_EMAIL || "teacher@eduai.com",
        password: process.env.TEACHER_PASSWORD || "teacher123",
        role: "teacher"
      },
      {
        name: "Demo Parent",
        email: process.env.PARENT_EMAIL || "parent@eduai.com",
        password: process.env.PARENT_PASSWORD || "parent123",
        role: "parent"
      },
      {
        name: "Demo Admin",
        email: process.env.ADMIN_EMAIL || "admin@eduai.com",
        password: process.env.ADMIN_PASSWORD || "admin123",
        role: "admin"
      }
    ];

    for (const spec of devUsers) {
      const emailLower = spec.email.toLowerCase();
      let user = await User.findOne({ email: emailLower });

      if (!user) {
        user = await User.create({
          name: spec.name,
          email: emailLower,
          role: spec.role,
          password_hash: hashPassword(spec.password)
        });
        console.log(`[SEED] Created default ${spec.role} account: ${emailLower}`);
      } else {
        // Keep credentials up to date with .env values during test reload
        user.password_hash = hashPassword(spec.password);
        user.role = spec.role;
        await user.save();
      }

      // If user is a teacher, make sure they have a verified TeacherProfile ready for socket matching
      if (spec.role === "teacher") {
        await TeacherProfile.findOneAndUpdate(
          { userId: user._id },
          {
            verificationStatus: "verified",
            isOnline: true,
            isFree: true,
            subjects: ["Mathematics", "Science", "English", "Social Studies", "Physics", "Chemistry", "Biology", "Computer Science"],
            languages: ["English", "Telugu", "Hindi", "Spanish", "French"],
            rating: 5.0,
            experience: 5
          },
          { upsert: true, new: true }
        );
        console.log(`[SEED] Verified Teacher Profile synced for user: ${emailLower}`);
      }
    }
  } catch (err) {
    console.error("[SEED] Error seeding dev users:", err);
  }
};

module.exports = { seedDevUsers };
