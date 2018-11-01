const async = require('async');
const axios = require('axios');
const getContent = require('./content');

const faviconController = {};

faviconController.getFavicon = async (req, res, next) => {
  console.log('doing stuff in here with,', req.body);
  const { url, getFresh } = req.body;
  const verifiedUrl = await verifyUrl(url);
  res.locals.url = await getFaviconForUrl({ url: verifiedUrl, getFresh });
  next();
}

module.exports = faviconController;


/* BEGIN HELPER FUNCTIONS */

// set number of urls to fetch favicons from
const NUM_TO_FETCH = 200;

// makes a call to /favicon.ico with provided url
const getFaviconForUrl = async ({ url, getFresh = true }) => {
  let faviconUrl;
  await axios.get(`${url}/favicon.ico`, { timeout: NUM_TO_FETCH * 100 })
    .then(res => {
      // if we get a 200 return that favicon url
      if (res.status === 200) faviconUrl = `${url}/favicon.ico`;
    })
    .catch((err) => {
      // if we get a 404 try to scrape the html
      // let scrapedUrl = scrape(url);
      // if (scrapedUrl) faviconUrl = scrapedUrl
      // else {
        notFound += 1;
        faviconUrl = `No result found for ${url}`;
      // }
    });
  return faviconUrl;
};


// keep track of not found urls
let notFound = 0;

// get all favicons
const findAllFavicons = async () => {
  console.time(`Approximate time to fetch ${NUM_TO_FETCH} urls`);
  // first populate an array of URLs
  const res = await getContent();
  const urls = res.slice(0, NUM_TO_FETCH);

  async.mapLimit(urls, NUM_TO_FETCH / 10, async (url) => {
    const response = await getFaviconForUrl({ url, getFresh: false });
    return { [url]: response };
  }, (err, results) => {
    if (err) throw err;
    // results is now an array of the response bodies
    console.log({ results });
    console.log({ notFound });
    console.timeEnd(`Approximate time to fetch ${NUM_TO_FETCH} urls`);
  });
};

const verifyUrl = async (url) => {
  let verifiedUrl;
  await axios.get(`${url}`)
    .then(res => {
      console.log(res.config.url);
    })
    .catch((err) => {
      verifiedUrl = `No result found for ${url}`;
    });
  return url;
}