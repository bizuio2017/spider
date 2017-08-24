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

    console.log('anglialist url =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }

    var data = await getByKeyword(q.keyword);
    //console.log('Final round ===crawler result =====' + JSON.stringify(data));
    return await data;
    ///////////////////////////////////before module
}

async function getPage( html) {

    let $ = await cheerio.load(html);

    let ipages = 0
    let pages = $('.CatalogList_amon_div').text();
    pages = pages.substr(pages.indexOf('of') + 2).trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    console.log("get final pages " + pages);
    if (pages == "") {
        pages = 0;
    } else {
        pages = Number.parseInt(pages);
    }
    if (isNaN(pages) || !isFinite(pages)) {
        console.log("pages is Nan or finite.")
        stockn = 0;
    }

    //computer pages number per page 20 default
    if (pages < 20) {
      pages = 0
    } else if (pages == 20) {
      pages = 1
    } else {
      if (pages %20 ==0) {
        pages = Number.parseInt(pages / 20)
      }else {
        pages = Number.parseInt(pages / 20 ) + 1
      }
    }

    return pages;
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

    console.log('get daxing proxy found ===' + proxyIp.found);
    if (!proxyIp.found) {
        console.log('get da xiang proxy ip error\n');
        proxyIp.proxyip = undefined;
    } else {
    	console.log('get daxing proxy ip=' + proxyIp.proxyip.toString());
    }


    //not using da xiang proxy ip
    console.log("Debug mode not undefinedneed proxy.")
    nightmare = Nightmare({waitTimeout: 8000, show: false });


    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            //'proxy-server': proxyIp // set the proxy server here ...
            'proxy-server': undefined,// set the proxy server here ...
            //'proxy-server': proxyIp.proxyip.toString() // set the proxy server here ...
        },
        webPreferences: {
            images: false
        },
        waitTimeout: 8000,
        show: false
    });

    // var url = keyword;
    //anglia-live only crawler detail page use xvfb nightmare crawler all with different node adn proxy ip distrubte cluster
    var url = baseurl ;

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('.Catalog_list_content1 .CatalogList_amon_div .CatalogList_amon_div_nr li')
        .wait(500)
        .evaluate(function() {
            return document.querySelector('.Catalog_list_content1').innerHTML;
        })
        .end()
        .then(async(html) => {
            //console.log('get html=============== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

            await getAllSuppliers(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    //console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result.status = 0;
                    result.cats = data.cats;
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


async function getAllSuppliers(html) {
    let res = { cats: []};
    let $ = await cheerio.load(html);
    let cats = await $('.CatalogList_amon_div');

    if (!(typeof cats !== 'undefined' && cats)) {
        console.log('cats undefined...' + cats);
        return res;
    }

    //  console.log('get szlcsc table html ==' + owners);
    let wishcats = ['15','16','17','18','19','20','21','22','27'];
    //get cats
    await Promise.all(cats.toArray().map(async cat => {
        //console.log('get szlcsc table html ==' + $(cat));
        //get cat title
        let catNo = await $(cat).find('.CatalogList_amon_div_title a').eq(0).text().trim().split('.')[0];

        let b = await  wishcats.find((value) =>{
            return value === catNo
        });

	//console.log('if is exixst b====' + b);

	if( b !== undefined) {
	//console.log('catno==XXXXXXxxxxxxx ok' + catNo);
        //crawler subcat
        let subcats = await $(cat).find('.CatalogList_amon_div_nr ul li');
        await Promise.all(subcats.toArray().map(async subcat => {
          let caturl = await $(subcat).find('a').attr('href').trim();
          caturl = 'http://www.szlcsc.com' + caturl;
	  //console.log('final get cat url....=' + caturl);
          // console.log("AAAffftterr........row =" + JSON.stringify(rdata));
          res.cats.push(await caturl);
        }));

	}

    }));

    return await res;
}
