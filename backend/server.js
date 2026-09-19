const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("Shutting down the Server due to Uncaught Excetion");
  process.exit(1);
});

// Load config relative to this file so the server works from any directory.
dotenv.config({ path: require("path").join(__dirname, "config", "config.env") });

if (!process.env.DB_URI || !process.env.JWT_SECRET_KEY) {
  throw new Error(
    "Missing DB_URI or JWT_SECRET_KEY. Copy config/config.env.example to config/config.env and fill in the values."
  );
}

//connect to Database

connectDatabase();

const port = Number(process.env.PORT) || 5001;
const DB_server = app.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});

//unhandle Promise rejection exception

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Error : ${err.stack}`);
  console.log("Shutting down the Server due to unhandle promise rejection");

  DB_server.close(() => {
    process.exit(1);
  });
});
