const puppeteer = require('puppeteer');

// scrape site for a single favicon
module.exports = async (url) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    let favicon = await page.evaluate(() => {
      let match;
      const nodeList = Array.from(document.getElementsByTagName('link'));
      nodeList.forEach(node => {
        if (
          node.getAttribute('rel') === 'icon'
          || node.getAttribute('rel') === 'shortcut icon'
        ) {
          match = node.getAttribute('href');
        }
      });

      return match;
    });

    browser.close();

    // if no link is found
    if (!favicon) return `No favicon found for ${url}!`;

    // if a link starts with '//' append https:
    // else concat the full url
    if (favicon[0] === '/') {
      if (favicon[1] === '/') favicon = `https:${favicon}`;
      else favicon = url + favicon;
    }

    return favicon;
  } catch (err) {
    console.log(`Please provide a valid url for: ${url}`, err);
    return null;
  }
};

// regex is faster but returns full link tag so does not
// easily account for the '/' or '//' differentiation
// let matches = markup.match(/\S*?.ico'/ig);
