import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import sgMail from "@sendgrid/mail";

dotenv.config();
const app = express();
const port = 3000;
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const db = new pg.Client({
  user: "postgres",
  password: process.env.DB_PASSWORD,
  host: "localhost",
  database: "users",
  port: 5432,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
    const extension = path.extname(file.originalname);  
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);  
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, 
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

const storageForPosts = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploadsForPosts/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
    const extension = path.extname(file.originalname);  
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);  
  }
});

const uploadForPosts = multer({
  storage: storageForPosts,
  limits: { fileSize: 1000000 }, 
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

const generateCode = () => {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000; 
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use('/uploadsForPosts', express.static('uploadsForPosts'));

db.connect();

app.get("/", (req, res) => {
  res.json({message: "Welcome!"});
});

app.post("/", upload.single("profileImg"), async (req, res) => {
  try {
    if (req.body.type === "Register") {
    
      const { username, password, email } = req.body;
      const profileImg = req.file;

      if (!profileImg) {
        return res.status(400).json({ error: "Only image files are allowed!" });
      }

      const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists." });
      }

      const usernameCheck = await db.query("SELECT * FROM users WHERE username = $1", [username]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: "Username already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const result = await db.query(
        "INSERT INTO users (username, password, email, profile_image) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, hashedPassword, email, profileImg.filename]  
      );
      return res.json({
        message: "User registered successfully",
        userId: result.rows[0].id,
      });

    } else if (req.body.type === "Login") {
      const { username, password, email } = req.body;
      const user = await db.query("SELECT id, password FROM users WHERE email = $1", [email]);

      if (user.rows.length === 0) {
        return res.status(404).json({ error: "No email matched" });
      }

      const storedHashedPassword = user.rows[0].password;
      const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
      if (passwordMatch) {
        return res.json({ message: "Authenticated", userId: user.rows[0].id });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }

    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.post('/forgot-my-password', async (req, res) => {
  try {
    const { email } = req.body;
    const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length == 0) {
        return res.status(400).json({ error: "Email don't exists." });
      }

      const code = String(generateCode());
      const msg = {
        to: email,
        from: process.env.FROM,
        subject: 'Forgot Your Password for The Coder',
        text: `Code: ${code}`,
        html: `<p>Code: ${code}</p>`
      }
    await sgMail.send(msg);

    res.json({message: "code sent!", code: code});
  }
  catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.post('/submit-new-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]  
    );

    res.json({message: "The password has been updated"});
  }
  catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.get("/home/user/:userId", async (req, res) => {
  try {
    const posts = await db.query(`
      SELECT posts.*, users.profile_image
      FROM posts
      INNER JOIN users ON posts.author = users.id;`
    );
   
    const postsWithImages = posts.rows.map(post => ({
      ...post,
      profile_image: `${process.env.SERVER_URL_USER}${post.profile_image}`,
      image: `${process.env.SERVER_URL_POST}${post.image}`
    }));

    res.json(postsWithImages);
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.get("/user/:userId/post/:postId/random-posts", async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const posts = await db.query(`
      SELECT * FROM posts
      WHERE author != $1 AND id != $2
      ORDER BY RANDOM()
      LIMIT 5
    `, [userId, postId]);

    if (posts.rows.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    const postsWithImages = posts.rows.map(post => ({
      ...post,
      image: `${process.env.SERVER_URL_POST}${post.image}`
    }));

    res.json(postsWithImages);
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.get("/user/:userId/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const posts = await db.query(`
      SELECT posts.*, users.username
      FROM posts
      INNER JOIN users ON posts.author = users.id
      WHERE posts.id = $1;
    `, [postId]);

    const postsWithImages = posts.rows.map(post => ({
      ...post,
      image: `${process.env.SERVER_URL_POST}${post.image}`
    }));

    res.json(postsWithImages[0]);
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});


app.patch("/user/:userId/post/:postId", uploadForPosts.single("postImgFile"), async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, content } = req.body;
    const image = req.file ? req.file.filename : null;

    const updatedPost = await db.query(
      "UPDATE posts SET title = $1, description = $2, content = $3, image = COALESCE($4, image) WHERE id = $5 RETURNING *",
      [title, description, content, image, postId]
    );

    if (updatedPost.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      message: "The post has been successfully edited",
      post: updatedPost.rows[0],
    });
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.delete("/user/:userId/post/:postId", async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const postCheck = await db.query(
      "SELECT * FROM posts WHERE id = $1 AND author = $2",
      [postId, userId]
    );

    if (postCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post." });
    }

    await db.query("DELETE FROM posts WHERE id = $1", [postId]);
    res.json({ message: "The post has been successfully deleted" });
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.get("/my-posts/user/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    const posts = await db.query(`
      SELECT posts.*, users.profile_image
      FROM posts
      INNER JOIN users ON posts.author = users.id
      WHERE posts.author = $1;
    `, [id]);

    const postsWithImages = posts.rows.map(post => ({
      ...post,
      image: `${process.env.SERVER_URL_POST}${post.image}`,
      profile_image: `${process.env.SERVER_URL_USER}${post.profile_image}`
    }));

    res.json(postsWithImages);
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.post("/my-posts/user/:userId", uploadForPosts.single("postImgFile"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, content } = req.body;
    const image = req.file ? req.file.filename : null;

    const newPost = await db.query(
      "INSERT INTO posts (title, description, content, tags, image, author) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, content, "", image, parseInt(userId)]
    );

    if (newPost.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
  
    res.json({
      message: "The post has been successfully added",
      post: newPost.rows[0],
    });
  } catch (error) {
    console.error("Error during database query", error);
    return res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
