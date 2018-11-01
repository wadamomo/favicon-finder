const async = require('async');
const axios = require('axios');
const getContent = require('./content');

// set number of urls to fetch favicons from
const URLS_TO_FETCH = 200;

// keep track of not found urls
let notFound = 0;

// makes a call to /favicon.ico with provided url
const getFaviconForUrl = async ({ url, getFresh = true }) => {
  let faviconUrl;
  await axios.get(`${url}/favicon.ico`, { timeout: URLS_TO_FETCH * 100 })
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

// get all favicons
const findAllFavicons = async () => {
  console.time(`Approximate time to fetch ${URLS_TO_FETCH} urls`);
  // first populate an array of URLs
  const res = await getContent();
  const urls = res.slice(0, URLS_TO_FETCH);

  async.mapLimit(urls, URLS_TO_FETCH / 10, async (url) => {
    const response = await getFaviconForUrl({ url, getFresh: false });
    return { [url]: response };
  }, (err, results) => {
    if (err) throw err;
    // results is now an array of the response bodies
    console.log({ results });
    console.log({ notFound });
    console.timeEnd(`Approximate time to fetch ${URLS_TO_FETCH} urls`);
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

const faviconController = {};

faviconController.getFavicon = async (req, res, next) => {
  console.log('doing stuff in here with,', req.body);
  const { url, getFresh } = req.body;
  const verifiedUrl = await verifyUrl(url);
  res.locals.url = await getFaviconForUrl({ url: verifiedUrl, getFresh });
  next();
}

module.exports = faviconController;
