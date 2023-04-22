const express = require('express');
const router = express.Router();
const getPageText = require('../modules/getPageText');
const extractElementFromText = require('../modules/extractElementFromText');
const getPageTitle=require('../modules/getPageTitle')
const { ObjectId } = require('mongodb');

// Route handler for submitting a form
router.post('/submit', async (req, res) => {
  const { url, extract } = req.body;
  // Retrieve user from MongoDB based on user ID
  const db = req.app.locals.db;
  const userID = req.signedCookies.userID;
  const user = await db.collection('users').findOne({ _id: new ObjectId(userID) })
 
  try {
    const title = await getPageTitle(url)
    const text = await getPageText(url);

    const response = await extractElementFromText(text, extract);
    console.log(response.status)

    const result = response.data.choices[0].message.content;

    response.data.choices[0].message.content = response.data.choices[0].message.content;
    response.data.prompt = response.config.data
    response.data.url = url
    response.data.title = title
    response.data.date = new Date()

    if (!Array.isArray(user.history)) {
      await db.collection('users').updateOne({ _id: new ObjectId(userID) }, { $set: { history: [] } });
    }
    await db.collection('users').updateOne({ _id: new ObjectId(userID) },{$push:{history:response.data}});
    
    res.status(200).send('done')
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
