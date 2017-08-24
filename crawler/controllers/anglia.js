var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.anglia-live.com/products/batteries-accessories/batteries/ic-batteries-memory-backup/254412001_snaphat-battery-for-timekeeper';

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

async function getRow(html) {
    let $ = await cheerio.load(html);
    let res = {steps:[], prices:[]};

    //remove \r\n and space with str replace
    let prodDiv = await $('#ctl00_ContentPlaceHolder1_producttitlecontainer h1.productinfo');
    console.log("get product proDiv" + prodDiv);
    let part = await prodDiv.find('.tierstoincludeindescription').html().split('<br>')[1].replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    let pro_maf = await prodDiv.find('.tierstoincludeindescription').html().split('<br>')[2].replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    await prodDiv.find('.tierstoincludeindescription').remove();
    let pdesc = await prodDiv.text().trim().replace(/\r\n|\n/g, "");
    res.description = pdesc;
    res.part = part;
    res.pro_maf = pro_maf;

    let prodInfoDiv = await $('#ctl00_ContentPlaceHolder1_descriptionContainer ul.productinfoiconfields');
    let pkgtype = await prodInfoDiv.find('span.labeltext').eq(0).text().replace(/s+/g, "").replace(/\r\n|\n/g, "");
    let rohs = await prodInfoDiv.find('span.labeltext').eq(1).text().replace(/s+/g, "").replace(/\r\n|\n/g, "");
    let tcode = await prodInfoDiv.find('span.labeltext').eq(3).text().replace(/s+/g, "").replace(/\r\n|\n/g, "");
    res.pkgtype = pkgtype;
    res.rohs = rohs;
    res.tcode = tcode;

    let proAvaile = await $('#ctl00_ContentPlaceHolder1_dvEnhancedStockAvailabilityChart ul.stockAvailabilityChart');
    let stock = await proAvaile.find('.value').eq(0).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let reserveStock = await proAvaile.find('.value').eq(1).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let totalStockDue = await proAvaile.find('.value').eq(2).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let totalResStockDue = await proAvaile.find('.value').eq(3).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let supplierLeadTime = await proAvaile.find('.value').eq(4).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let spq = await proAvaile.find('.value').eq(5).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let moq = await proAvaile.find('.value').eq(6).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    let orderMultiple = await proAvaile.find('.value').eq(7).text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    res.stock = stock;
    res.reserveStock = reserveStock;
    res.totalStockDue = totalStockDue;
    res.totalResStockDue = totalResStockDue;
    res.supplierLeadTime = supplierLeadTime;
    res.spq = spq;
    res.moq = moq;
    res.orderMultiple = orderMultiple;

    let ps = await $('#ctl00_ContentPlaceHolder1_dvProductPriceContainer ul.pricebreaks li');

    await Promise.all(ps.toArray().map(async p => {
        let step = await $(p).find('.label').text().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
        res.steps.push(step);

        let price = await $(p).find('.value span#pricesplitprice').text().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
        if (price === "") {
            console.log("get price = space default set it to 0.");
            price = 0.0;
        } else {
            price = Number.parseFloat(price);
        }
        if (isNaN(price) || !isFinite(price)) {
            console.log("rmb is Nan or finite.")
            price = 0.0;
        }
        res.prices.push(price);
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
        //loadTimeout: 80000,
        webPreferences: {
            images: false,
            webSecurity: false
        },
        show: false
    });


    //not using da xiang proxy ip
   // console.log("Debug mode not undefinedneed proxy.")
    //nightmare = Nightmare({waitTimeout: 8000, show: false });


    var url = keyword;
    //anglia-live only crawler detail page use xvfb nightmare crawler all with different node adn proxy ip distrubte cluster
    // var url = baseurl ;

    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)
        // .wait('table#ucProductList_tbltop > tbody ul.product-list.products-plain > li')
        .wait('#mainDiv #ctl00_ContentPlaceHolder1_dvProductPriceContainer')
        .wait(500)
        .evaluate(function() {
            return document.querySelector('#mainDiv').innerHTML;
        })
        .end()
        .then(async(html) => {
            //console.log('get html=============== html =' + html);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);

            await getRow(html)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    // console.log("FFFFFFFFFFFFinall after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    data.status = 0;
                    data.keyword = result.keyword
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
