var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.icgoo.net/search/?partno=';

// http://www.hqchip.com/search/2222.html



module.exports.crawler = async function(q) {
    ////////////////////////////////////start module

    console.log('ickey =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }


    var data = await getByKeyword(q.keyword);
    //console.log('Final round ===crawler result =====' + JSON.stringify(data));
    return await data;
    ///////////////////////////////////before module
}


/////////////////function

async function getRow($, html) {
    let row = await $(html);
    let res = { stockstep: [], hk: [], rmb: [] };

    //remove \r\n and space with str replace
    let part = row.find('td').eq(0).find('span p a').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    let pro_maf = row.find('td').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");


    // console.log("this funcc call is getRow.... html=" + html);
    //let stocks = $(row).find('td.w75').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

    let stock = row.find('td').eq(2).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (stock == "") {
        stock = 0;
    } else {
        stock = Number.parseInt(stock);
    }
    if (isNaN(stock) || !isFinite(stock)) {
        console.log("stock is Nan or finite.")
        stockn = 0;
    }

    res.part = part;
    res.pro_maf = pro_maf;
    res.stock = stock;

    //stock step
    let prices = await row.find('td.price li').toArray();
    prices.map(async price => {

        let stockn = await $(price).find('span').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseInt(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0;
            }

            res.stockstep.push(stockn);
        }

        let hk = await $(price).find('span').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (hk) {
            hk = Number.parseFloat(hk);
            if (isNaN(hk) || !isFinite(hk)) {
                hk = 0.0;
            }
            res.hk.push(hk);
        }


        let rmb = await $(price).find('span').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (rmb) {
            rmb = Number.parseFloat(rmb);
            if (isNaN(rmb) || !isFinite(rmb)) {
                rmb = 0.0;
            }
            res.rmb.push(rmb);
        }
    });



    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { icgoo: [], sups: [] };
    let $ = await cheerio.load(html);

    /////get icgoo prices and stock.
    // let icgoo = await $('#results > div[id^="order"').toArray();

    // let icgoo = await $('#results > div[id^="order_"]').toArray();
/*
    let orders = ["_1", "_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_10"];

    await Promise.all(orders.map(async order => {
        let selector = "#order" + order;

        console.log('selectort====' + selector);
        let icgoo = await $(selector);
        //get suppliers

        console.log('get ordier_1 icgoo html =' + icgoo);

        let supname = await $(icgoo).find('.supplier').attr('id').toString().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");;

        if (supname) {
            console.log("supname==" + supname);
            let rows = await $(icgoo).find('#result tbody tr');

            console.log('get  xxxx rows =' + rows);

            //notice this await don't useful wait for get empty rdata
            let rdata = await getSuppliers($, rows);
            console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
            res.icgoo.push({
                name: supname,
                data: await rdata
            });
        }

    }));
*/

    /////get suppliers prices and stock.
    let sups = await $('.supplier').toArray();
    await Promise.all(sups.map(async sup => {
        //get suppliers
        let supname = await $(sup).attr('id').toString().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");;

        if (supname) {
            let rows = await $(sup).find('> .result > table > tbody > tr');

            //notice this await don't useful wait for get empty rdata
            let rdata = await getSuppliers($, rows);
            // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
            res.sups.push({
                name: supname,
                data: await rdata
            });
        }
    }));



    // console.log('A====f===ter call getRow rowdata====' + JSON.stringify(res));
    return res;
}

async function getSuppliers($, html) {
    let rows = await $(html);

    if (!(typeof rows !== 'undefined' && rows)) {
        console.log('rows undefined...' + rows);
        return res;
    }

    let res = [];
    //get suppliers prices and stock.
    await Promise.all(rows.toArray().map(async row => {
        let rdata = await getRow($, row);
        console.log("AAAffftterr........row =" + JSON.stringify(rdata));
        res.push(rdata);
    }));

    // console.log("getsuppliers res= " + JSON.stringify(res));
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

    //icgoo must not use proxy-server ,it will cause can't crawler!!!
    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            //'proxy-server': proxyIp // set the proxy server here ...
            'proxy-server': await proxyIp.proxyip // set the proxy server here ...
            // 'proxy-server': await proxyIp.proxyip.toString() // set the proxy server here ...
        },
        webPreferences: {
            images: false
        },
        show: false
    });

    //not using proxy ip
    //     console.log("Debug mode not undefinedneed proxy.")
    //     nightmare = Nightmare({ show: false });

    var url = baseurl + keyword + "&qty=1";

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        //.wait('#topcontainer  > .supplier > .result > table > tbody > tr')
        .wait('#topcontainer   tbody ')
        .wait(5000)
        .evaluate(function() {
            //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
            //return document.querySelector('#list1545 tbody').innerText;
            return document.querySelector('#topcontainer').innerHTML;
        })
        .end()
        .then(async (html) => {
            // console.log('get html==== rows =' + html);
            durT = moment().unix() - startT;
            console.log("get root contain html spendxxx" + durT);


            await getAllSuppliers(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    // console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result.status = 0;
                    result.sups = data.sups;
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
