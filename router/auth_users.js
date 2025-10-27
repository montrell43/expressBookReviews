const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
//let users = require("./auth_users.js").users;
const public_users = express.Router();
const regd_users = express.Router();

let users = [];
const JWT_SECRET = "mySuperSecretKey";

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let existingUsers = users.filter(user => user.username === username)
return existingUsers.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validUsers = users.filter(user => user.username === username && user.password === password);
return validUsers.length > 0;
}

// In auth_users.js (all routes under auth will use this middleware)
regd_users.use("/auth", (req, res, next) => {
    if (req.session && req.session.authorization && req.session.authorization.accessToken) {
        const token = req.session.authorization.accessToken;

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid or expired token" });
            req.user = decoded;
            next();
        });
    } else {
        return res.status(401).json({ message: "User not logged in or missing access token" });
    }
});

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add new user
  users.push({ username, password });
  return res.status(201).json({ message: `User ${username} successfully registered` });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and pasword are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    req.session.authorization = {
        accessToken,
        username
    };
    return res.status(200).json({ message: "user logged in successfully", token: accessToken });
  } else {
    return res.status(403).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!books[isbn].reviews) {
   books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ 
    message: "Review added/modified successfully",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // Delete the review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully",
    reviews: book.reviews
  });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
