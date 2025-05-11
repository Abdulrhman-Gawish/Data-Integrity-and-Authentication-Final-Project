const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();
const connectDB = require("./config/dbConnection");
const authRoute = require("./routes/authRoute");
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
});
