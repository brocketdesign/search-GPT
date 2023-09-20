const express = require('express');
const app = express();
const ip = require('ip');
const cookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');
const compression = require('compression');
//const data = require('./modules/data')

var index = require('./routes/index');
var api = require('./routes/api');

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Use cookie-parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(compression()); 
require('dotenv').config({ path: './.env' });

app.use('/', index);
app.use('/api', api);

MongoClient.connect(process.env.MONGODB_URL)
.then(client =>{
  const db = client.db('d2');
  global.db = db; 
});

const port = process.env.PORT || 8001
const server = app.listen(port, () => {
  console.log(`Express running → PORT http://${ip.address()}:${port}`);
});
