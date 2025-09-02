require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./user"); // Import the User model

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB", err);
  });

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Token blocklist (for logout) - in a larger app, use Redis for this
const tokenBlocklist = new Set();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied." });
  if (tokenBlocklist.has(token))
    return res.status(401).json({ message: "Token invalid." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid." });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// 1. Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Login a user
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Logout a user
app.post("/api/logout", authMiddleware, (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  tokenBlocklist.add(token);
  res.status(200).json({ message: "Successfully logged out." });
});

// 4. A Protected Route
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    // req.user comes from the token payload (id and username)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({
      message: `Welcome, ${user.username}! This is your profile.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
);
