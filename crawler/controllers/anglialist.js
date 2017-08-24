var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.anglia-live.com/products/batteries-accessories/batteries/ic-batteries-memory-backup';

// http://rightic.cn/search#/part=2222

module.exports.crawler = async function(q) {
    ////////////////////////////////////start module

    console.log('anglialist url =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }

    var data = await getByKeyword(q.keyword);
    console.log('Final round ===crawler result =====' + JSON.stringify(data));
    return await data;
    ///////////////////////////////////before module
}

async function getPage( html) {
    let res = [];
    let $ = await cheerio.load(html);

    let items = $('ul.product-list.products-plain > li');
    await Promise.all(items.toArray().map(async item => {
      //console.log("X######################li block html=" + item);
      let url = await $(item).find('.description-container > h3.productNameList a').first().attr("href").toString().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
      if(url) {
          console.log("get final detail url is " + url);
          res.push(url);
      }
    }));

    return res;
}

async function getByKeyword(keyword) {

    let result = { status: 1, keyword: keyword };
    //try{
    var startT = moment().unix();
    var durT = 0;
    console.log("Now start nightmare time is" + startT);

    var nightmare = {};
    //get proxy ip from daxiang.

    var proxyIp = await proxM.getProxyIps();

    if (!proxyIp.found) {
        console.log('get da xiang proxy ip error\n');
        proxyIp.proxyip = undefined;
    } else {
      console.log('get daxing proxy ip=' + proxyIp.proxyip.toString());
    }

    ///useing da xing proxy ip
    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            //'proxy-server': proxyIp // set the proxy server here ...
            'proxy-server': await proxyIp.proxyip // set the proxy server here ...
        },
        // loadTimeout: 30000,
         loadTimeout: 50000,
        webPreferences: {
            images: false,
            webSecurity: false
        },
        show: false
    });

    //not using da xiang proxy ip
    //console.log("Debug mode not undefinedneed proxy.")
    //nightmare = Nightmare({waitTimeout: 8000, show: false });

    var url = keyword;
    //anglia-live only crawler detail page use xvfb nightmare crawler all with different node adn proxy ip distrubte cluster
    // var url = baseurl ;

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('#ucProductList_pnlResults table#ucProductList_tbltop ul.product-list.products-plain > li')
        //.wait(1000)
        .evaluate(function() {
            return document.querySelector('#ucProductList_pnlResults table#ucProductList_tbltop').innerHTML;
        })
        .end()
        .then(async(html) => {
            //console.log('get html=============== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

            await getPage(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    // console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result.status = 0;
                    result.sups = data;
                    return result;
                });

        }).catch((e) => {
            console.error(e);
        });

    //   }catch(e) {
    //       console.error(e);
    //       return {status: 1, keyword: keyword, data: undefined};
    //   }

    // console.log("====================after await get result=" + JSON.stringify(result));

    durT = moment().unix() - startT;
    console.log("nightmare request spendxxx" + durT);
    return await result;


}
