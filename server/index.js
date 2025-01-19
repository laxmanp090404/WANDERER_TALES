const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const PostModel = require("./Models/Post");
require('dotenv').config()
const saltRounds = 10;
const secret = "asawq6q7q833e973ndi";
const app = express();

app.use(express.json()); // Handles JSON requests
app.use(express.urlencoded({ extended: true })); // Handles URL-encoded form data


// Updated CORS setup to allow credentials and specify allowed origins
const corsOptions = {
  origin: process.env.client_url, // Adjust this to your frontend origin
  credentials: true, // Enable sending cookies across domains
};

app.use(cors(corsOptions));
app.use(cookieparser());

const port = process.env.PORT || 4000; 
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

app.get('/',(req,res)=>{
    res.send("Welcome to wanderer tales server")
});
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.saltrounds) || 10);
    const user  = await UserModel.findOne({username});
     if(user){
       return res.status(200).json({message:"User already exists"});
     }
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
    res.status(500).json("Internal server error : " + { error: "Internal server error" ,message:"Error creating user" });
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
    const passOk = await bcrypt.compareSync(password, userDoc.password);
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
    res.status(500).json({ error: "Internal server error" ,message:"Error logging in" });
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
    // Wrap the decoded info in a 'user' object
    res.json({ user: decoded });
    console.log("decoded", decoded);
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


app.post("/createblog", async (req, res) => {
  try {
    const { title, place, summary, content, cover } = req.body;
    console.log("Payload received in createblog route:", req.body);

    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token not provided" });
    }

    const decoded = jwt.verify(token, secret);
    if (!title || !place || !summary || !content || !cover) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: { title, place, summary, content, cover },
      });
    }

    const newPost = await PostModel.create({
      title,
      place,
      summary,
      content,
      cover,
      author: decoded.id,
    });

    console.log("New Post Created:", newPost);
    return res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ error: "Internal server error", message: "Failed to create post" });
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
    res.status(500).json({ error: "Internal server error" ,message:"Error fetching posts" });
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
    res.status(500).json({ error: "Internal server error",message:"Error fetching post" });
  }
});

app.put(
  "/getblogposts/update/:id",
  async (req, res) => {
    console.log("Update post request received");
    try {
      const { id } = req.params;
      const { title, place, summary, content,cover } = req.body;
      const newPath = cover;
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
      res.status(200).json({post,message:"Successfully updated post"});
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ error: "Internal server error" ,message:"Error updating post"});
    }
  }
);

module.exports = app;
