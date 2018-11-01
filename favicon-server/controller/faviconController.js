const async = require('async');
const axios = require('axios');
const getContent = require('./content');
const Favicon = require('../model/faviconModel');


const faviconController = {};

// checks database for an existing favicon
// this is clearly not the way to do things
// these should be set up as controller methods
// so that requests can be made directly — but time :/
faviconController.checkForExistingFavicon = async (verifiedUrl) => {
  let faviconUrl;
  try {
    faviconUrl = await Favicon.find({ url: verifiedUrl });
    return faviconUrl;
  } catch (err) {
    console.log(`Error fetching favicon from db: ${err}`);
  }
};

// stores a favicon to the database
// likewise, this should also be set up as middleware
faviconController.saveFavicon = async (url, fav_url) => {
  const favicon = new Favicon({
    url,
    fav_url,
  });

  try {
    await favicon.save();
  } catch (err) {
    console.log(`Error saving favicon to db: ${err}`);
  }
};

// verifies url, checks db for existing favicons,
// and fetches fresh favicon if none found
faviconController.getFavicon = async (req, res, next) => {
  const { url } = req.body;
  let faviconUrl;
  
  try {
    // verify url is valid 
    const verifiedUrl = await verifyUrl(url);

    // check database for existing favicon
    // if found, store to res locals and respond
    const foundFavicon = await faviconController.checkForExistingFavicon(verifiedUrl);
    if (foundFavicon.length) {
      console.log({foundFavicon})
      res.locals.faviconUrl = foundFavicon[0];
      return next();
    }

    // make a new request for the favicon url
    faviconUrl = await getFaviconForUrl({ url: verifiedUrl });
    console.log(`new favicon fetched`)
    res.locals.faviconUrl = faviconUrl;

    // store favicon to database
    await faviconController.saveFavicon(verifiedUrl, faviconUrl);
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};

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
  // populate the array of 200K URLs
  const res = await getContent();
  const urls = res.slice(0, NUM_TO_FETCH);

  // tried to make this work with async but takes too long 
  // with more time i would have attempted to set up a cluster module
  // to create multiple child processes 
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