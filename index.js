const cheerioClient = require('cheerio-httpcli');
const list = require('./list.json');

module.exports.list = function() {
  return Promise.resolve(list);
};

module.exports.one = function(index) {
  return Promise.resolve(list[index]);
};

