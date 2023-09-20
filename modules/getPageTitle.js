const axios = require('axios');
const cheerio = require('cheerio');

async function getPageTitle(url) {
  try{
    const result = await global.db.collection('openai').findOne({url})
    if (result){
      console.log('Found this title in the database.')
      return result.title
    }
  }catch(err){
    console.log(err)
  }
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
