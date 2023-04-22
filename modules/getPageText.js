const puppeteer = require('puppeteer');

async function getPageText(url) {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    console.log('Creating new page...');
    const page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Extracting page text...');
    const cleanedText = await page.evaluate(() => {
      return document.querySelector('body').innerText.trim().replace(/[\n\r]+/g, '').replace(/\s+/g, ' ').slice(0,700);
    });
    console.log('Closing browser...');
    await browser.close();
    console.log('Page text extracted successfully.');
    return cleanedText;
  } catch (err) {
    console.error(err);
  }
}

module.exports = getPageText;
