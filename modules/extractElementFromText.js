const axios = require('axios');
require('dotenv').config({ path: './.env' });

const COMPLETIONS_MODEL = 'gpt-3.5-turbo';

function extractElementFromText(text, extract) {
  const prompt = `Your are an agent assistant. Use the text data a send you to help me.${extract}.Here is the text data :\n\n${text}`;
  const data = {
    "model": COMPLETIONS_MODEL,
    "messages": [{"role": "user", "content":prompt}],
    "temperature": 0.7,
    max_tokens: 300,
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  };

  return axios.post('https://api.openai.com/v1/chat/completions', data, config)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      if (error.response.status === 401) {
        console.error("Authentication error: check your API key");
      } else {
        console.error(error);
      }
    });
    
}

module.exports = extractElementFromText;
