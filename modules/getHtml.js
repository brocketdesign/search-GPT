const https = require('https');

function getHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let html = '';
      res.on('data', (chunk) => {
        html += chunk;
      });
      res.on('end', () => {
        resolve(html);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = getHtml;
