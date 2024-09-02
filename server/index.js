const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const PostModel = require("./Models/Post");
require('dotenv').config()
const saltRounds = 10;
const secret = "asawq6q7q833e973ndi";
const uploadMiddleware = multer({ dest: "upload/" });
const app = express();

app.use(express.json());

// Updated CORS setup to allow credentials and specify allowed origins
const corsOptions = {
  origin: process.env.client_url, // Adjust this to your frontend origin
  credentials: true, // Enable sending cookies across domains
};

app.use(cors(corsOptions));
app.use(cookieparser());
app.use("/upload", express.static(__dirname + "/upload"));

const port = process.env.PORT || 4000; // Adjusted port definition
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.mongo_url);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection error:", error);
  }
};
dbConnect();

// Rest of your code remains unchanged...

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
     const hashedPassword = bcrypt.hash(password,process.env.saltrounds);

    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
    });
    if(newUser){
      console.log("User created successfully:", newUser);
      res.status(201).json({newUser,message:"Created Your account successfully"});
    }
    else{
      res.status(400).json({message:"Not registered.Try Again"})
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json("Internal server error : " + { error });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await UserModel.findOne({ username });
    if(!username || !password){
      return res.status(400).json("Please enter all fields")
    }
    if (!userDoc) {
      return res.status(401).json("User not found");
    }
    const passOk = await bcrypt.compare(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign({ username, id: userDoc._id }, secret,{ expiresIn: process.env.JWT_EXPIRES_TIME });
      res.cookie("token", token, {
        expires: new Date(Date.now() + process.env.cookieExpiresTime * 24 * 60 * 60 * 1000),
        httpOnly: true
    });
      res.status(200).json({"message":"Login successful",user:userDoc,"token":token});
      console.log("cookie",res.cookie);
    } else {
      console.log(password)
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
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token not provided" });
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    res.clearCookie("token").json({ message: "Logout successful" });
  });
});


app.post("/createblog", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { title, place, summary, content } = req.body;
    const { path } = req.file;
    const parts = req.file.originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.rename(path, newPath, (err) => {
      if (err) {
        console.error("Error renaming file:", err);
      }
    });
    
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
    res.status(200).json(post,{message:"Post created successfully"});

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
    res.status(200).json(postDoc);
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
        fs.rename(path, newPath, (err) => {
          if (err) {
            console.error("Error renaming file:", err);
          }
        });
        
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
