var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.hqchip.com/search/';

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
    let res = { stockspec: [], stockstep: [], hk: [], rmb: [] };

    //remove \r\n and space with str replace
    let part = row.find('td.w140.break-word.g-posi-r.fs-14').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    let pro_maf = row.find('td.w120.break-word').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");


    // console.log("this funcc call is getRow.... html=" + html);
    //let stocks = $(row).find('td.w75').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

    //stock moq spq

    res.part = part;
    res.pro_maf = pro_maf;

    let stocksSpec = await row.find('td.speStock p').toArray();
    stocksSpec.map(async stock => {
        let stockn = await $(stock).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn === "") {
            console.log("get stock = space default set it to 0.");
            stockn = 0;
        } else {
            stockn = Number.parseInt(stockn);
        }
        if (isNaN(stockn) || !isFinite(stockn)) {
            console.log("stock is Nan or finite.")
            stockn = 0;
        }

        res.stockspec.push(stockn);
    });

    //stock step
    let stocksStep = await row.find('td.w75').eq(0).find('p').toArray();
    stocksStep.map(async stock => {

        let stockn = await $(stock).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        if (stockn) {
            stockn = Number.parseInt(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0;
            }

            res.stockstep.push(stockn);
        }
    });

    //hk prices
    let hks = await row.find('td.w75').eq(1).find('p').toArray();
    hks.map(async stock => {
        let stockn = await $(stock).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseFloat(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0.0;
            }
            res.hk.push(stockn);
        }
    });

    //rmb prices
    let rmbs = await row.find('td.w75').eq(2).find('p').toArray();

    rmbs.map(async stock => {
        let stockn = await $(stock).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {

            stockn = Number.parseFloat(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0.0;
            }
            res.rmb.push(stockn);
        }
    });

    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { sups: [] };
    let $ = await cheerio.load(html);
    let sups = await $('tr[data-fulltabname]').toArray();

    if (!(typeof sups !== 'undefined' && sups)) {
        console.log('sups undefined...' + sups);
        return res;
    }

    //get suppliers prices and stock.
    await Promise.all(sups.map(async sup => {
        //get suppliers
        let rows = await $(sup).find('tr[data-tabname]');

        let nodetype = rows.first().attr('data-tabname').toString();



        if (nodetype) {


            //notice this await don't useful wait for get empty rdata
            let rdata = await getSuppliers($, rows);
            // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
            res.sups.push({
                name: nodetype,
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
        // console.log("AAAffftterr........row =" + JSON.stringify(rdata));
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

    ///useing da xing proxy ip
    nightmare = Nightmare({
        switches: {
            // 'proxy-server': '10.8.11.240:8100' // set the proxy server here ...
            'proxy-server': await proxyIp.proxyip // set the proxy server here ...
            // 'proxy-server': await proxyIp.proxyip.toString() // set the proxy server here ...
        },
        webPreferences: {
            images: false
        },
        show: false
    });


    //not using da xiang proxy ip
    //console.log("Debug mode not undefinedneed proxy.")
    //nightmare = Nightmare({ show: false });


    var url = baseurl + keyword + ".html";

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('table.filter-list-res tbody')
        .evaluate(function() {
            //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
            //return document.querySelector('#list1545 tbody').innerText;
            return document.querySelector('table.filter-list-res tbody').innerHTML;
        })
        .end()
        .then(async(rows) => {
            //content = await parseHtml(html);
            // console.log('get html==== rows =' + rows);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);


            await getAllSuppliers(rows)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

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
