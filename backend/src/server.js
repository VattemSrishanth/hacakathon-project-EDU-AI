require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDb = require("./config/db");
const { initSocket } = require("./services/socketService");
const { seedDevUsers } = require("./utils/seeder");

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

const start = async () => {
  try {
    await connectDb();
    //console.log("Database connected");
    await seedDevUsers();
    initSocket(server);
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
