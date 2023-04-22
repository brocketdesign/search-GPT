const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  // Check if user is logged in
  const userID = req.signedCookies.userID;
  if (!userID) {
    return res.redirect('/user/login');
  }
  
  // Retrieve user from MongoDB based on user ID
  const db = req.app.locals.db;
  const user = await db.collection('users').findOne({ _id: new ObjectId(userID) });

  res.render('index', { user });
});
module.exports = router;
