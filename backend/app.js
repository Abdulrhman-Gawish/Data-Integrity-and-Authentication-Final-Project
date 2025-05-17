const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();
const app = express();
const connectDB = require("./config/dbConnection");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const logRoutes = require("./routes/logRoutes");
const errorHandler = require("./middleware/errorHandler");

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "config", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "config", "cert.pem")),
};

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "https://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", logRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;

// Connect to the database first
connectDB()
  .then(() => {
    const server = https.createServer(sslOptions, app);
    server.listen(PORT, () => {
      console.log(`Server running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });

