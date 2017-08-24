var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.szlcsc.com/so/global.html&global_search_keyword=';

//http://www.szlcsc.com/search/global.html&global_search_keyword=2222&global_current_catalog=&search_type=



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

async function getOwnerRow($, html) {
    let sup = await $(html);
    let res = { steps: [], prices: [] };

    // console.log("parse roooooow data ====" + sup);
    let part = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(1).find(' > td').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //remove \r\n and space with str replace
    //let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    // let pro_maf = row.find('td.w120.break-word').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");

    // console.log("this funcc call is getRow.... html=" + html);
    //let stocks = $(row).find('td.w75').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

    //stock moq spq
    let stock = sup.find('td[valign="top"]').eq(3).find('> table > tbody > tr').eq(2).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    stock = stock.replace(/[^\d\.]/g, '');
    if(stock == "") {
      stock = 0;
    }else {
      stock = Number.parseInt(stock);
      if(isNaN(stock) || !isFinite(stock)) {
        console.log("stock is Nan or finite.")
        stock = 0;
      }
    }
    res.stock = stock;

    let pro_cat = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(0).find('>td').eq(0).find('a').first().text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pro_detail = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(2).find('>td').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    let pro_pkg = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(3).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pro_desc = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(4).find('>td').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    let pro_maf = sup.find('td[valign="top"]').eq(1).find('> table > tbody > tr').eq(0).find('>td').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    res.part = part;
    res.pro_maf = pro_maf;

    res.pro_cat = pro_cat;
    res.pro_detail = pro_detail;
    res.pro_pkg = pro_pkg;
    res.pro_brand = pro_desc;

    //not include index 0 params.
    let prices = $(html).find('td[valign="top"]').eq(2).find('table > tbody > tr').slice(1);
    await Promise.all(prices.toArray().map(async(stock) => {

        // console.log("00000000000000000000 funcc call is getRow.... html=" + $(stock));
        let stockstep = await $(stock).find(' > td').eq(0).find(' > span  > span').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
        let idx = stockstep.indexOf('~');
        if(idx == -1){
          //10000片以上：
          stockstep = stockstep.replace(/[^\d\.]/g, '');
          if(stockstep == "") {
            stockstep = 0;
          }else {
            stockstep = Number.parseInt(stockstep);
            if(isNaN(stockstep) || !isFinite(stockstep)) {
              console.log("stockstep is Nan or finite.")
              stockstep = 0;
            }
            res.steps.push(stockstep);
          }
        } else {
          //"100~900片：",
          //get 100 first
          stockstep = stockstep.substr(0, idx);
          //get number
          stockstep = stockstep.replace(/[^\d\.]/g, '');
          if(stockstep == "") {
            stockstep = 0;
          }else {
            stockstep = Number.parseInt(stockstep);
            if(isNaN(stockstep) || !isFinite(stockstep)) {
              console.log("stockstep is Nan or finite.")
              stockstep = 0;
            }
            res.steps.push(stockstep);
        }

        //price
        let prNode = await $(stock).find(' > td').eq(1);

        // console.log("00000000000000000000 funcc call is getRow.... html=" + prNode);

        // .innerText.replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        stockn = await prNode.find('span.STYLE10').first().text().trim().replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if(stockn) {
           stockn = Number.parseFloat(stockn);
           if (isNaN(stockn) || !isFinite(stockn)) {
               stockn = 0.0;
           }
           res.prices.push(await stockn);
         }


        stockn = await prNode.find('span.trigger').first().text().trim().replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseFloat(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0.0;
            }
            res.prices.push(await stockn);
        }
      }

    }));


    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { data: []};
    let $ = await cheerio.load(html);
    let owners = await $('tbody.product_tbody_cls');

    if (!(typeof owners !== 'undefined' && owners)) {
        console.log('owners undefined...' + owners);
        return res;
    }

    //  console.log('get szlcsc table html ==' + owners);

    //get owners
    await Promise.all(owners.toArray().map(async owner => {
        //get suppliers
        let row = await $(owner).find('tr').eq(1);

        // console.log('get szlcsc table row html ==' + row);

        //console.log('row html =' + row);
        let detail = await getOwnerRow($, row);
        // console.log("AAAffftterr........row =" + JSON.stringify(rdata));
        res.data.push(await detail);
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
        webPreferences: {
            images: false
        },
        show: false
    });


    //not using da xiang proxy ip
    // console.log("Debug mode not undefinedneed proxy.")
    // nightmare = Nightmare({ show: false });

    //http://www.szlcsc.com/search/catalog_603_1_0_1-0-0-3-1_0.html&queryBeginPrice=null&queryEndPrice=null
    // var url = baseurl + keyword + "&global_current_catalog=&search_type=";
    var url = {}
    if (Array.isArray(keyword)) {
        url = keyword[0]
    } else {
       url = keyword;
    }

    console.log("nightmare szcsclist XXX will goto url===.", url);

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        //.wait('#self_product_list_div table#productTab tbody.product_tbody_cls')
        .wait('.Catalog_right_Details tbody.product_tbody_cls ')
        .wait(1000)
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
                    result.data = data.data;
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
