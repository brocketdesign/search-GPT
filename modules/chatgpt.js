const axios = require('axios');
require('dotenv').config({ path: './.env' });

const COMPLETIONS_MODEL = 'text-davinci-003';
const EMBEDDING_MODEL = 'text-embedding-ada-002';

const prompt = "Who won the 2020 Summer Olympics men's high jump?";
const data = {
  prompt: prompt,
  temperature: 0,
  max_tokens: 300,
  model: COMPLETIONS_MODEL
};
const config = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  }
};

axios.post('https://api.openai.com/v1/completions', data, config)
  .then((response) => {
    const result = response.data.choices[0].text.trim();
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
