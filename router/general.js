const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require("axios");


public_users.post("/register", (req,res) => {
  //Write your code here
  const  { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" })
  }

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" })
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', "async/books", async (req, res)=> {
  //Write your code here
  try {
     const response = await axois.get("http://localhost:5000/");
    return res.status(200).json(response.data)
  } catch (error) {
    return res.status(500).json({ message: error })
  }
});

public_users.get('async2/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`http:/localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data)
  } catch (error) {
    return res.status(404).json({ message: "Book not found or error fetching data"})
  }
});

public_users.get('async2/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http:/localhost:5000/author/${author}`);
    return res.status(200).json(response.data)
  } catch (error) {
    return res.status(404).json({ message: "Author not found or error fetching author data"})
  }
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
  const results = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
  const results = Object.values(books).filter(
    book => book.title.toLowerCase().includes(title)
  );

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn]

  if (book) {
    return res.status(200).json(book.reviews || {});
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
