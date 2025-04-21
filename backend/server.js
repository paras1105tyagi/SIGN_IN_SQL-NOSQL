const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1); // Exit with failure
});

// Connect SQL
const sequelize = require("./config/sql");
const SQLUser = require("./models/sql/User");

// Sync SQL models without dropping existing tables
sequelize.sync({ alter: false })
  .then(() => {
    console.log("SQL DB connected and synced successfully");
    startServer();
  })
  .catch((err) => {
    console.error("SQL sync error:", err);
    process.exit(1); // Exit with failure
  });

// Routes
app.use("/api/auth", require("./routes/auth"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

function startServer() {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
