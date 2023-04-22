const express = require('express');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const router = express.Router();

// GET login page
router.get('/login', (req, res) => {
  res.render('user', { isLogin: true });
});

// POST login credentials
router.post('/login', async (req, res) => {
  const { emailOrName, password } = req.body;

  // Retrieve user from MongoDB based on email or name
  const db = req.app.locals.db;
  const user = await db.collection('users').findOne({ $or: [{ email: emailOrName }, { name: emailOrName }] });

  // Check if user exists and password is correct
  if (user && await bcrypt.compare(password, user.password)) {
    // Generate signed cookie with user ID and name
    const userID = user._id.toString();
    const name = user.name;
    res.cookie('userID', userID, { signed: true });
    res.cookie('name', name, { signed: true });
    res.redirect('/');
  } else {
    res.render('user', { isLogin: true, error: 'Invalid email or name or password' });
  }
});


// GET signup page
router.get('/signup', (req, res) => {
  res.render('user', { isLogin: false });
});

// POST signup credentials
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into MongoDB
  const db = req.app.locals.db;
  const result = await db.collection('users').insertOne({ name: name, email: email, password: hashedPassword });

  // Generate signed cookie with new user ID
  const userID = result.insertedId.toString();
  res.cookie('userID', userID, { signed: true });
  res.redirect('/');
});

// GET logout page
router.get('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/');
});

module.exports = router;
