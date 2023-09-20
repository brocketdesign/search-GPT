const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  const data = await global.db.collection('openai').find().toArray()
  res.render('index',{data});
});
module.exports = router;
