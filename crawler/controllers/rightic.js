var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://rightic.cn/search#/part=';

// http://rightic.cn/search#/part=2222



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


async function getRow($, html) {
    let row = await $(html);
    let res = {};

    //remove \r\n and space with str replace
    let part = row.find('td').eq(0).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    let pro_maf = row.find('td').eq(1).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");

    let stock = await row.find('td').eq(3).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (stock === "") {
        console.log("get stock = space default set it to 0.");
        stock = 0;
    } else {
        stock = Number.parseInt(stock);
    }
    if (isNaN(stock) || !isFinite(stock)) {
        console.log("stock is Nan or finite.")
        stockn = 0;
    }
    //moq
    let moq = await row.find('td').eq(4).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (moq === "") {
        console.log("get moq = space default set it to 0.");
        moq = 0;
    } else {
        moq = Number.parseInt(moq);
    }
    if (isNaN(moq) || !isFinite(moq)) {
        console.log("stock is Nan or finite.")
        moq = 0;
    }
    //step
    let step = await row.find('td').eq(5).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (step === "") {
        console.log("get step = space default set it to 0.");
        step = 0;
    } else {
        step = Number.parseInt(step);
    }
    if (isNaN(step) || !isFinite(step)) {
        console.log("step is Nan or finite.")
        step = 0;
    }

    //rmb
    let rmb = await row.find('td').eq(6).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (rmb === "") {
        console.log("get rmb = space default set it to 0.");
        rmb = 0.0;
    } else {
        rmb = Number.parseFloat(rmb);
    }
    if (isNaN(rmb) || !isFinite(rmb)) {
        console.log("rmb is Nan or finite.")
        rmb = 0.0;
    }

    let suppli = row.find('td').eq(11).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");

    res.part = part;
    res.pro_maf = pro_maf;
    res.stock = stock;
    res.moq = moq;
    res.step = step;
    res.rmb = rmb;
    res.supplier = suppli;

    return res;
}


//keyword example STPS20M100SG-TR
async function getAllSuppliers(html) {
    let res = { sups: [] };
    let $ = await cheerio.load(html);

    //console.log('htmllll=' + $);
    let sups = await $('tr[ng-repeat="data in sea.resultsShow"]');

    // console.log('getXXXXXXXXXXXXXXXXXXXXXXX table html ==' + sups);

    //get suppliers prices and stock.
    await Promise.all(sups.toArray().map(async sup => {
        //get suppliers
        console.log("###################################row.........");
        let row = $(sup);
        let data = await getRow($, row);
        // console.log("AAAffftterr........row =" + JSON.stringify(data));
        res.sups.push(data);
    }));

    // console.log('A====f===ter call getRow rowdata====' + JSON.stringify(res));
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
        loadTimeout: 80000,
        webPreferences: {
            images: false,
            webSecurity: false
        },
        show: false
    });


    //not using da xiang proxy ip
    console.log("Debug mode not undefinedneed proxy.")
    nightmare = Nightmare({ show: false });


    var url = baseurl + keyword;

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        .wait('table#tableSearchData tbody > tr[ng-repeat="data in sea.resultsShow"]')
        .wait(3000)
        .evaluate(function() {
            return document.querySelector('table#tableSearchData tbody ').innerHTML;
        })
        .end()
        .then(async(html) => {
            // console.log('get html=============== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

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
