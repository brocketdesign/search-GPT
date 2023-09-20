const express = require('express');
const router = express.Router();
const getPageText = require('../modules/getPageText');
const fetchOpenAICompletion = require('../modules/fetchOpenAICompletion');
const getPageTitle=require('../modules/getPageTitle')
const postArticleToWordpress = require('../modules/postArticleToWordpress')
const { ObjectId } = require('mongodb');


router.post('/openai/custom/:type', async (req, res) => {
  let { url } = req.body;
  const type = req.params.type
  let prompt = ''
  const content = await getPageText(url);

  if (type == 0 && content) {
    prompt = `
    以下の内容を基に、ブログのタイトルを生成してください。
    タイトルは短くて、内容の要点をつかむものにしてください。
    コロン（：）や日付、重複するフレーズは使用しないでください。
    ユニークで興味を引くタイトルを目指してください。

    \n\n${content}\n\n
    `;
}

if (type == 1 && content) {
  prompt = `
  以下の文章を使用して、Markdown形式でブログの内容を再構築してください。**タイトルや冒頭の見出しのようなものは追加しないでください**。
  本文をさらに詳しくし、関連する新しい情報や詳細を追加してください。
  読者が理解しやすいように、適切な場所での改行を心がけてください。
  別の観点や独自の意見も組み込んで、内容を豊かにしてください。

  \n\n${content}\n\n
  `;
}

if(prompt == ''){
  console.log('Please, provide a prompt')
  res.status(500).send('Internal server error');
  return
}


  try {
    // The filter criteria to find the document
    const filter = { url: url };

    // The update operation
    const update = {
      $set: {
        content,
        prompt: prompt
      }
    };

    // Options: upsert ensures the document is inserted if it doesn't exist
    const options = { upsert: true, returnDocument: 'after' };

    const result = await global.db.collection('openai').findOneAndUpdate(filter, update, options);

    // Fetch the _id, whether it's an updated or newly inserted document
    const insertedId = result.value._id;
    
    res.json({
      redirect: `/api/openai/stream?id=${insertedId}&type=${type}`,
      insertedId: insertedId
    });

  } catch (error) {
  console.log(error);
  res.status(500).send('Internal server error');
  }
});

router.get('/openai/stream/', async (req, res) => {
  const id = req.query.id;
  const type = req.query.type

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  res.flushHeaders(); // Flush the headers to establish the SSE connection

  try {
      // Fetch the prompt from the database using the provided id
      const record = await global.db.collection('openai').findOne({ _id: new ObjectId(id) });

      if (!record) {
          res.write('data: {"error": "Record not found"}\n\n');
          res.end();
          return;
      }

      const prompt = record.prompt;

      const messages = [
        { role: 'system', content: 'あなたは優れたアシスタントです' },
        { role: 'user', content: prompt },
      ];
    

      const fullCompletion = await fetchOpenAICompletion(messages, res);

      const item = await global.db.collection('openai').findOne({ _id: new ObjectId(id) })
      // The filter criteria to find the document
      const filter = { url: item.url };

      // The update operation
      let update = {
        $push: {
          [type == 0 ? 'title' : 'text']: { fullCompletion , date : new Date() }
        }
      };


      // Options: upsert ensures the document is inserted if it doesn't exist
      const options = { upsert: true, returnDocument: 'after' };

      const result = await global.db.collection('openai').findOneAndUpdate(filter, update, options);

      res.write('event: end\n');
      res.flush(); // Flush the response to send the data immediately
      res.end();
  } catch (error) {
      console.log(error);
      res.write('data: {"error": "Internal server error"}\n\n');
      res.end();
  }
});
router.post('/postArticle', async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const blog = {
    url: '',
    username: '',
    password: ''
  }
  try {
    const result = await postArticleToWordpress( {title,content},blog );

    // Check if posting was successful (this depends on what your function returns)
    if (result) {
      return res.json({
        status: 'success',
        message: '記事が正常に投稿されました' // Article successfully posted
      });
    } else {
      return res.json({
        status: 'error',
        message: '記事の投稿に失敗しました' // Failed to post the article
      });
    }

  } catch (error) {
    // Handle any errors that occurred during the process
    console.error("Error in posting article: ", error);
    return res.json({
      status: 'error',
      message: '内部エラーが発生しました' // Internal error occurred
    });
  }
});

module.exports = router;
