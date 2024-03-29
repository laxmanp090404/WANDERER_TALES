const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const PostModel = require("./Models/Post");

const saltRounds = 10;
const secret = "asawq6q7q833e973ndi";
const uploadMiddleware = multer({ dest: "upload/" });
const app = express();

app.use(express.json());
app.use(
  cors({ credentials: true, origin: "https://wanderer-tales.vercel.app" })
);
app.use(cookieparser());
app.use("/upload", express.static(__dirname + "/upload"));

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

const dbConnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://laxmanpanjalingam2004:sairam@cluster0.bslmqko.mongodb.net/TravelBlog3?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection error:", error);
  }
};
dbConnect();

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
    });
    console.log("User created successfully:", newUser);
    res.json(newUser);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(401).json("User not found");
    }
    const passOk = await bcrypt.compare(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign({ username, id: userDoc._id }, secret);
      res.cookie("token", token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
    } else {
      res.status(401).json("Wrong credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Token not provided" });
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    res.json(decoded);
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json("Logout successful");
});

app.post("/createblog", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { title, place, summary, content } = req.body;
    const { path } = req.file;
    const parts = req.file.originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    const { token } = req.cookies;
    const decoded = jwt.verify(token, secret);
    const post = await PostModel.create({
      title,
      place,
      summary,
      content,
      cover: newPath,
      author: decoded.id,
    });
    res.json(post);
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getblogposts", async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getblogposts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await PostModel.findById(id).populate("author", [
      "username",
    ]);
    if (!postDoc) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(postDoc);
  } catch (error) {
    console.error("Get blog post by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put(
  "/getblogposts/update/:id",
  uploadMiddleware.single("file"),
  async (req, res) => {
    console.log("Update post request received");
    try {
      const { id } = req.params;
      const { title, place, summary, content } = req.body;
      let newPath = null;
      if (req.file) {
        const { path } = req.file;
        const parts = req.file.originalname.split(".");
        const ext = parts[parts.length - 1];
        newPath = path + "." + ext;
        fs.renameSync(path, newPath);
      }
      const { token } = req.cookies;
      const decoded = jwt.verify(token, secret);
      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.author.toString() !== decoded.id) {
        return res.status(401).json({ message: "You are not the author" });
      }
      post.title = title;
      post.place = place;
      post.summary = summary;
      post.content = content;
      if (newPath) {
        post.cover = newPath;
      }
      await post.save();
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = app;
