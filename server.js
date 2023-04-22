const express = require('express');
const app = express();
const ip = require('ip');
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');

//const data = require('./modules/data')

var index = require('./routes/index');
var api = require('./routes/api');
var user = require('./routes/user');

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Use cookie-parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

require('dotenv').config({ path: './.env' });

app.use('/', index);
app.use('/api', api);
app.use('/user', user);

MongoClient.connect(process.env.MONGODB_URL)
.then(client =>{
  const db = client.db('d2');
  app.locals.db = db;
});

const port = process.env.PORT || 8001
const server = app.listen(port, () => {
  console.log(`Express running → PORT ${ip.address()}:${port}`);
});
