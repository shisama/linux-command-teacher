const cheerioClient = require('cheerio-httpcli');
const fs = require('fs');
const path = require('path');

const baseUrl = "http://hocolamogg.com/unix/linux_com/";
const backupdir = path.join(__dirname, "backup");

const getCommandList = function(url){
  return searchClearly(url, function($){
    var results = [];

    const kinou = $(".kinou").text();
    if (kinou) {
      return {
        kinou: kinou
      }
    }

    $("table[class='maintable'] tr").each( function (i) {
      const target = $(this);
      const anchor = target.find("a").eq(0);
      const summary = target.find("td").eq(1).text();
      const href = anchor.attr("href");

      if (!href) {
        return;
      }

      results.push({
        name : anchor.text(),
        summary: summary,
        href: href,
        kinou: kinou
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
          resolve(clearly( $ ));
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

(async () => {
  const [
    commands
  ] = await Promise.all([
    getCommandList(`${baseUrl}index.html`),
    backup(backupdir)
  ]);
  const list = [];
  for (const command of commands) {
    const each = await getCommandList(baseUrl + command.href);
    list.push({
      name: command.name,
      summary: command.summary,
      explanation: each.kinou
    })
  }
  fs.writeFileSync('./list.json', JSON.stringify(list, null, "  "), {encoding: 'utf-8'})
})();