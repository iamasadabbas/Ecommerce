const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const DataBaseConnection = require("./config/databaseConnection");

//====================================================//
//========HANDLING UNCAUGHT EXCEPTION ===============//
//==================================================//
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception ${err.message}`);
  console.log("Server is shtting down due to Uncaught Exception");

  process.exit(1);
});

//==============================================//
//==================CONFIG   ==================//
//============================================//
dotenv.config({ path: "backend/config/config.env" });

//====================================================//
//====DB CONNECT (MUST CALL AFTER ENV CONFIG)   =====//
//==================================================//
DataBaseConnection();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//=================================================================//
//====Start the server listening to specified  ===================//
//====PORT from environment variable or default 3001 if not =====//
//===============================================================//

//Store in Varibale for exit server on Unhandled promise Rejection
const server = app.listen(process.env.PORT, () => {
  console.log(`Servver is running on port ${process.env.PORT}`);
});

//====================================================//
//========= UNHANDLED PROMISE REJECTION  ============//
//==================================================//

process.on("unhandledRejection", (err) => {
  //handle errors here
  console.log(`Error: ${err.message}`);
  console.log("Server is shutting down due to unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
