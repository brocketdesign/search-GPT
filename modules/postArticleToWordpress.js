const wordpress = require("wordpress");

async function postArticleToWordpress({ post, blog }) {
  const client = wordpress.createClient({
    url: blog.url,
    username: blog.username,
    password: blog.password
  });

  if (!content) {
    throw new Error("Article content is required");
  }
  return new Promise((resolve, reject) => {
    client.newPost({
      title: post.title,
      content: post.content,
      status: 'draft' || 'publish'
    }, (error, id) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          status: 'success',
          message: `Article posted successfully with ID: ${id}`,
        });
      }
    });
  });
}

module.exports = postArticleToWordpress;
