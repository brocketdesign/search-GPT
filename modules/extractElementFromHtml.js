const axios = require('axios');
require('dotenv').config({ path: './.env' });
function extractElementFromHtml(html, extract) {
  const data = {
    prompt: `Extract the "${extract}" element from the following HTML:\n\n${html}`,
    temperature: 0.5,
    max_tokens: 100,
    n: 1,
    stop: ['\n']
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  };
  return axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', data, config)
    .then((res) => {
      const text = res.data.choices[0].text;
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');
      const jsonString = text.substring(startIndex, endIndex + 1);
      console.log(jsonString)
      return JSON.parse(jsonString);
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = extractElementFromHtml;
