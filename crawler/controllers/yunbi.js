var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.szlcsc.com/search/global.html&global_search_keyword=';

//http://www.szlcsc.com/search/global.html&global_search_keyword=2222&global_current_catalog=&search_type=

//# https://yunbi.zendesk.com/hc/zh-cn/sections/115001437708-%E4%B8%9A%E5%8A%A1%E5%85%AC%E5%91%8A

module.exports.crawler = async function(q) {
    ////////////////////////////////////start module

    console.log('ickey =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }


    var data = await getByKeyword(q.keyword);
    // console.log('Final round ===crawler result =====' + JSON.stringify(data));
    return await data;
    ///////////////////////////////////before module
}


/////////////////function

async function getHaiwaiRow($, html) {
    let sup = await $(html);
    let res = { stockstep: [], rmb: [] };

    // console.log("parse roooooow data ====" + sup);
    let part = sup.find('td.xs_left').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pro_maf = sup.find('td.xs_left').eq(1).find('font').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
      //stock moq spq
    let stock = sup.find('td.xs').eq(0).find('li').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    res.part = part;
    res.pro_maf = pro_maf;
    res.stock= stock;

    //not include index 0 params.
    let prices = $(html).find('td.xs').eq(1).find('.shoujiaqj');
    await Promise.all(prices.toArray().map(async(stock) => {

        // console.log("00000000000000000000 funcc call is getRow.... html=" + $(stock));
        let stockstep = await $(stock).find('.shoujiaqj_left').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");;
        res.stockstep.push(stockstep);
        //price

        stockn = await $(stock).find('.shoujiaqj_right').first().text().trim().replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseFloat(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0.0;
            }
            res.rmb.push(await stockn);
        }

    }));


    return res;
}


async function getOwnerRow($, html) {
    let sup = await $(html);
    let res = {};

    // console.log("parse roooooow data ====" + sup);
    let title = sup.find('a').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let link  = sup.find('a').eq(0).attr("href").trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    res.title = title;


    //will crawler link detail content fill content.

    //not include index 0 params.
    let prices = $(html).find('td[valign="top"]').eq(2).find('table > tbody > tr').slice(1);
    await Promise.all(prices.toArray().map(async(stock) => {

        // console.log("00000000000000000000 funcc call is getRow.... html=" + $(stock));
        let stockstep = await $(stock).find(' > td').eq(0).find(' > span  > span').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");;
        res.stockstep.push(stockstep);
        //price
        let prNode = await $(stock).find(' > td').eq(1);

        // console.log("00000000000000000000 funcc call is getRow.... html=" + prNode);

        // .innerText.replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        stockn = await prNode.find('span.STYLE10').first().text().trim().replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if(stockn) {
           res.rmb.push(await stockn);
         }


        stockn = await prNode.find('span.trigger').first().text().trim().replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseFloat(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0.0;
            }
            res.rmb.push(await stockn);
        }

    }));


    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { items: [] };
    let $ = await cheerio.load(html);

    var items = $('section.section-content ul.article-list li.article-list-item ')

    if(!(typeof items !== 'undefined' && items)) {
      console.log('items undefined...' + items);
      return res;
    }

    for(i = 0; i< items.length; i++ ) {
        console.log(items[i])
    }
    //  console.log('get szlcsc table html ==' + owners);

    //get owners
    await Promise.all(items.toArray().map(async item => {
        //get suppliers

        // console.log('get szlcsc table row html ==' + row);

        //console.log('row html =' + row);
        let rdata = await getOwnerRow($, item);
        // console.log("AAAffftterr........row =" + JSON.stringify(rdata));
        res.owners.push({ rdata });
    }));

    //get haiwai
    let haiwais = await $('.haiwaidg');
    await Promise.all(haiwais.toArray().map(async haiwai => {
        //get suppliers
        let display = await $(haiwai).css('display');

        if ( display != 'none') {
          let rows = await $(haiwai).find('.haiwaidg_txt > table > tbody').slice(1);
          let supname = await $(haiwai).attr('id').toString();
          // console.log("AAAffftterr........row =" + JSON.stringify(rdata));

          let rdata = await getSuppliers($, rows);
	  res.sups.push({
              name: supname,
              data: await rdata
          });

        }

    }));

    return res;
}

async function getSuppliers($, html) {
          let rows = await $(html);

          let res = [];

          await Promise.all(rows.toArray().map(async row => {
                let rdata = await getHaiwaiRow($, row);
		res.push(rdata);
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

    console.log('get daxing proxy ip=' + proxyIp.proxyip.toString());
    if (!proxyIp.found) {
        console.log('get da xiang proxy ip error\n');
    }

    ///useing da xing proxy ip
    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            //'proxy-server': proxyIp // set the proxy server here ...
            'proxy-server': await proxyIp.proxyip // set the proxy server here ...
        },
        webPreferences: {
            images: false
        },
        show: false
    });


    //not using da xiang proxy ip
    // console.log("Debug mode not undefinedneed proxy.")
    // nightmare = Nightmare({ show: false });

    //http://www.szlcsc.com/search/global.html&global_search_keyword=2222&global_current_catalog=&search_type=
    var url = baseurl + keyword + "&global_current_catalog=&search_type=";

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        //.wait('#self_product_list_div table#productTab tbody.product_tbody_cls')
        .wait('.Catalog_right_Details #brokageProductList_div .haiwaidg')
        .evaluate(function() {
            //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
            //return document.querySelector('#list1545 tbody').innerText;
            return document.querySelector('.Catalog_right_Details').innerHTML;
        })
        .end()
        .then(async(html) => {
            // console.log('get html==== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

            await getAllSuppliers(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    // console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result.status = 0;
                    result.data = data;
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


//tool for map to json convert.
function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}

function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
}

function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}
