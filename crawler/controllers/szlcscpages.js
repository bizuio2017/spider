var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.szlcsc.com/product/catalog.html';

// http://rightic.cn/search#/part=2222

module.exports.crawler = async function(q) {
    ////////////////////////////////////start module

    console.log('szlcscpage url =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }

    var data = await getByKeyword(q.keyword);
    //console.log('Final round ===crawler result =====' + JSON.stringify(data));
    return await data;
    ///////////////////////////////////before module
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
        //not using da xiang proxy ip
        console.log("Debug mode not undefinedneed proxy.")
        proxyIp.proxyip = undefined;
    } else {
      console.log('get daxing proxy ip=' + proxyIp.proxyip.toString());
    }

      console.log('nightmare will crawler url =' + keyword);


    nightmare = Nightmare({waitTimeout: 8000, show: false });


    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            //'proxy-server': proxyIp // set the proxy server here ...
            'proxy-server': proxyIp.proxyip // set the proxy server here ...
            //'proxy-server': proxyIp.proxyip.toString() // set the proxy server here ...
        },
        webPreferences: {
            images: false
        },
        waitTimeout: 8000,
        show: false
    });

    var url = keyword;
    //anglia-live only crawler detail page use xvfb nightmare crawler all with different node adn proxy ip distrubte cluster
    //var url = baseurl ;

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('.fanye li')
        .wait(500)
        .evaluate(function() {
            return document.querySelector('.fanye').innerHTML;
        })
        .end()
        .then(async(html) => {
            //console.log('get html=============== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

            await getPages(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    //console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result = data;
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


async function getPages(html) {
    let res = {status: 1};
    let $ = await cheerio.load(html);

    let page = await $('ul > li');
    let linode = page.eq(page.length -2);

    let pagemax = page.eq(page.length - 2).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pageurl = page.eq(page.length - 2).find('a').attr('href').trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let pageurl = page.eq(page.length - 2).find('a').attr("href");

    if (pagemax == "") {
        pagemax = 0;
    } else {
        pagemax = Number.parseInt(pagemax);
    }
    if (isNaN(pagemax) || !isFinite(pagemax)) {
        console.log("pages is Nan or finite.")
        pagemax = 0;
    }
    console.log("Get max page=" + pagemax);

    //base = http://www.szlcsc.com
    //pageurl = search/catalog_590_1_0_1-0-0-3-1_0.html&queryBeginPrice=null&queryEndPrice=null

    let le2 = pageurl.indexOf('_', pageurl.indexOf('_') + 1);

    if (le2 != -1 && pagemax > 0){
      let le3 = pageurl.indexOf('_', le2+1);

      let baseurl = "http://www.szlcsc.com";
      let beforeurl = pageurl.substr(0, le2 + 1);
      res.pagemax = pagemax;
      res.preurl = baseurl + beforeurl;
      res.suxurl =  pageurl.substr(le3);
      res.status = 0;
    }

    return await res;
}
