require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const port = Number(process.env.PORT || 4000);

const start = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
