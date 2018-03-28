const cheerioClient = require('cheerio-httpcli');
const fs = require('fs');
const path = require('path');

const getCommandList = function(){
  return searchClearly( "http://hocolamogg.com/unix/linux_com/index.html", function($){
    var results = [];
    $("table[class='maintable'] tr").each( function (i) {
      var target = $(this);
      var anchor = target.find("a").eq(0);
      var summary = target.find("td").eq(1).text();

      if (!anchor.attr("href")) {
        return;
      }

      results.push({
        "name" : anchor.text(),
        "summary": summary
      });
    });
    return results;
  });

  function searchClearly(url, clearly){
    const promiseCheerio = cheerioClient.fetch(url);
    return new Promise(function (resolve, reject) {
      promiseCheerio.then( function( cheerioResult ){
        if( cheerioResult.error ){
          reject( cheerioResult.error );
        } else {
          const $ = cheerioResult.$;
          resolve({
            "list" : clearly( $ )
          });
        }
      }, function( error ){
        reject( error );
      });
    });
  }
};

function backup(dir, callback) {
  return new Promise (function(resolve, reject) {
    fs.access(dir, fs.constants.W_OK, function (err) {
      if (err) {
        if (err.code === "ENOENT") {
          fs.mkdirSync(dir);
        } else {
          console.log("Error! backup failed.")
          return;
        }
      }
      const timestamp = Math.floor(Date.now() / 1000);
      fs.readFile(path.join(__dirname, "list.json"), function (err, data) {
        fs.writeFile(path.join(dir, "list.json." + timestamp), data);
        resolve();
      });
    })
  });
}

const backupdir = path.join(__dirname, "backup");

getCommandList().then(function(result) {
  return backup(backupdir);
}).then(function() {
  fs.writeFileSync('./list.json', JSON.stringify(result.list), {encoding: 'utf-8'})
});
