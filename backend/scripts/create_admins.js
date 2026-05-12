require("dotenv").config();
const readline = require("readline");
const connectDb = require("../src/config/db");
const User = require("../src/models/User");
const { hashPassword } = require("../src/utils/password");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const lines = [];

console.log("Paste admin lines as name,email,password. Submit an empty line to finish.");

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    rl.close();
    return;
  }
  lines.push(trimmed);
});

const upsertAdmins = async () => {
  if (lines.length === 0) {
    console.log("No input received.");
    return;
  }

  await connectDb();

  const results = [];
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 3) {
      results.push({ line, status: "skipped" });
      continue;
    }

    const name = parts[0].trim();
    const email = parts[1].trim().toLowerCase();
    const password = parts.slice(2).join(",").trim();

    if (!name || !email || !password) {
      results.push({ line, status: "skipped" });
      continue;
    }

    const payload = {
      name,
      email,
      role: "admin",
      password_hash: hashPassword(password)
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: payload },
      { upsert: true, new: true }
    ).lean();

    results.push({ email: user.email, status: "ok" });
  }

  console.log("Admin accounts processed:");
  results.forEach((item) => {
    if (item.email) {
      console.log(`- ${item.email}: ${item.status}`);
    } else {
      console.log(`- ${item.line}: ${item.status}`);
    }
  });
};

rl.on("close", () => {
  upsertAdmins()
    .catch((err) => {
      console.error("Failed to create admins", err);
    })
    .finally(() => {
      process.exit(0);
    });
});
