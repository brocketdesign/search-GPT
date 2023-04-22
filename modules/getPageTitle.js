const axios = require('axios');
const cheerio = require('cheerio');

async function getPageTitle(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $('title').text();
    return title;
  } catch (error) {
    console.error(error);
  }
}
module.exports=getPageTitle
