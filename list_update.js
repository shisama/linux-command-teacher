const cheerioClient = require('cheerio-httpcli');
const fs = require('fs');

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

getCommandList().then(function(result) {
  fs.writeFileSync('./list.json', JSON.stringify(result.list), {encoding: 'utf-8'})
});
