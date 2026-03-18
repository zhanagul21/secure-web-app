require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const documentsRoutes = require("./routes/documentsRoutes");
const logsRoutes = require("./routes/logsRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AUTHGUARD LOCKER API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/logs", logsRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});