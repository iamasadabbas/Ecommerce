const express = require("express");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require('cors');

const app = express();
app.use(cors(
    {
    origin: 'http://localhost:3000',
    credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
    httpOnly: false, //
  }
));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//==============================================//
//=================ROUTES  ====================//
//============================================//
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/v1", require("./routes/orderRoute"));

//==============================================//
//=============Middleware For Errors===========//
//============================================//

app.use(errorMiddleware);

module.exports = app;
