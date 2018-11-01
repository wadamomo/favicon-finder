const fs = require('fs');

// helper function to grab only the first 200K urls
const parseUrls = (content) => {

  // grab everything before url number 200K
  const pre200K = content.substr(0, content.indexOf('200000,'));

  // get rid of carriage returns, digits, and commas
  const parsedUrls = pre200K.split('\n').map(url => url.slice(url.indexOf(',') + 1));

  return parsedUrls;
};

// fetch raw data from the top 1m sites file
// call parseurls to filter for only first 200K
module.exports = () => new Promise((res, rej) => {
  fs.readFile('./assets/top-1m.csv', { encoding: 'utf8' }, (err, data) => {
    if (err) return rej(err);
    return res(parseUrls(data));
  });
});
