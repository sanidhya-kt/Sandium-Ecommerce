const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const data = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useCreateIndex: true,
     // useFindAndModify: true,
    });
    console.log(`mongodb connected with server: ${data.connection.host}`);
  } catch (error) {
    console.error(`mongodb connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;
