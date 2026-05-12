const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/edu_ai";
  await mongoose.connect(uri, { autoIndex: true });
};

module.exports = connectDb;
