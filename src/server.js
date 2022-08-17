const express = require("express");
const connectDB = require("./database");
const cloudinary = require("cloudinary");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const env = require("dotenv");

// routes import
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");

const paymentRoute = require("./routes/paymentRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");

// express middleware
const app = express();
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true }));
app.use(cookieParser());
env.config();


// cors config
const corsOptions = {
    origin: [process.env.FRONT_END_URL, process.env.ADMIN_URL],
    credentials: true 
  };

app.use(cors(corsOptions));


// mongoDb database connection
connectDB();

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/order", orderRoute);

// error handler middleware
app.use(errorMiddleware);

// start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
