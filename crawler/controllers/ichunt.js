var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.ichunt.com/Search/index.html?keywords=';

// http://www.ichunt.com/Search/index.html?keywords=2222&kNums=&sourceType=0&areaType=0&goodsType=0

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
    let sup_name = row.find('li').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    let part = row.find('li').eq(1).find('>a.fc_li').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pro_maf = row.find('li').eq(2).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");


    // console.log("this funcc call is getRow.... html=" + html);
    //let stocks = $(row).find('td.w75').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

    //stock moq spq

    res.part = part;
    res.supname = sup_name;
    res.pro_maf = pro_maf;

    //ku chun
    let stocksSpec = await row.find('li').eq(4).find('p').toArray();
    stocksSpec.map(async stock => {
        let stockn = await $(stock).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (stockn) {
            stockn = Number.parseInt(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                console.log("stock is Nan or finite.");
                stockn = 0;
            }

            res.stockspec.push(stockn);
        }
    });

    //ti du  , rmb, hk
    let stocksStep = await row.find('li.w250.morePrice .link').toArray();
    stocksStep.map(async stock => {

        let stockn = await $(stock).find('p').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        if (stockn) {
            stockn = Number.parseInt(stockn);
            if (isNaN(stockn) || !isFinite(stockn)) {
                stockn = 0;
            }

            res.stockstep.push(stockn);
        }

        //rmb
        let rmb = await $(stock).find('p').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        if (rmb) {
            rmb = Number.parseFloat(rmb);
            if (isNaN(rmb) || !isFinite(rmb)) {
                rmb = 0.0;
            }
            res.rmb.push(rmb);
        }

        //hk
        let hk = await $(stock).find('p').eq(2).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');

        if (hk) {
            hk = Number.parseFloat(hk);
            if (isNaN(hk) || !isFinite(hk)) {
                hk = 0.0;
            }
            res.hk.push(hk);
        }

    });

    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { sups: [] };
    let $ = await cheerio.load(html);

    //get supps
    let searchboxs = await $('.searchbox').toArray();
    await Promise.all(searchboxs.map(async searchbox => {
        //notice this await don't useful wait for get empty rdata
        let sups = await $(searchboxs).find('.searchbox > section > section.cont').toArray();

        await Promise.all(sups.map(async sup => {

            let rows = await $(sup).find('>ul').toArray();

            await Promise.all(rows.map(async row => {

                let r = await $(row);
                // console.log("section=====###########################################################################" + $(row));
                let rdata = await getRow($, $(row));
                // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
                res.sups.push(rdata);
            }));
        }));
    }));


    //mouser
    // let resultMouser = await $('section#resultMouser > ul').toArray();
    // await Promise.all(resultMouser.map(async rows => {
    //     //notice this await don't useful wait for get empty rdata
    //     let rdata = await getRow($, rows);
    //     // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
    //     res.sups.push(rdata);
    // }));

    // //resultDigikey
    // let resultDigikey = await $('section#resultDigikey > ul').toArray();
    // await Promise.all(resultDigikey.map(async rows => {
    //     //notice this await don't useful wait for get empty rdata
    //     let rdata = await getRow($, rows);
    //     // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
    //     res.sups.push(rdata);
    // }));

    // //resultChip1Stop
    // let resultChip1Stop = await $('section#resultChip1Stop > ul').toArray();
    // await Promise.all(resultChip1Stop.map(async rows => {
    //     //notice this await don't useful wait for get empty rdata
    //     let rdata = await getRow($, rows);
    //     // console.log('AA====....f===ter call getRow rowdata====' + JSON.stringify(rdata));
    //     res.sups.push(rdata);
    // }));

    // let resultFchips2 = await $('section#resultFchips2');
    // console.log("result Fchips ===" + resultFchips2);
    // let fchips = await getFchips($, resultFchips2);
    // res.fchips = await fchips;
    // console.log('A====f===ter call getRow rowdata====' + JSON.stringify(res));
    return res;
}

async function getFchips($, html) {
    let rows = await $(html).find('section#resultFchips2 >section').toArray();
    let res = [];

    //get suppliers prices and stock.
    await Promise.all(rows.map(async row => {

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
            // 'proxy-server': '115.220.0.200:808' // set the proxy server here ...
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


    var url = baseurl + keyword + "&kNums=&sourceType=0&areaType=0&goodsType=0";

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('#divSearch .tabcont.tab_one .searchbox > section > section')
        .evaluate(function() {
            //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
            //return document.querySelector('#list1545 tbody').innerText;
            return document.querySelector('#divSearch .tabcont.tab_one').innerHTML;
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
