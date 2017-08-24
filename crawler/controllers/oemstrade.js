var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");
let moment = require("moment");
var config = require('config');
var proxM = require('./getProxyIps')

let baseurl = 'http://www.oemstrade.com';
let keywords = ['2222', 'LP18'];
let finalRes = new Map([
    ['2222', []],
    ['LP18', []]
]);



module.exports.crawler = async function(q) {
    ////////////////////////////////////start module

    console.log('ickey =' + q.keyword);
    if (!(typeof q.keyword !== 'undefined' && q.keyword)) {
        console.log('q.keyword undefined...' + q.keyword);
        return undefined;
    }


    var data = await getByKeyword(q.keyword);
    console.log('final===crawler result =====' + JSON.stringify(data));
    res = await data;


    return res;
    ///////////////////////////////////before module
}


/////////////////function

async function parseRow($, row) {
    //remove \r\n and space with str replace
    let part = $(row).find('td.td-part-number').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "");
    //let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    let pro_maf = $(row).find('td.td-distributor-name').text().trim();
    //let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
    let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
    //let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
    // let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");



    let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
    if (stock === "") {
        console.log("get stock = space default set it to 0.");
        stock = 0;
    }
    stock = Number.parseInt(stock);
    if (isNaN(stock) || !isFinite(stock)) {
        console.log("stock is Nan or finite.")
        stock = 0;
    }

    let r = { part: {}, stock: {}, pl: [], pr: [] };
    r.part = part;
    r.pro_maf = pro_maf;
    r.description = description;
    r.stock = stock;

    await $(row).find('td.td-price ').each(function(i, elem) {

        //let price_left = $(row).find('span.list-left').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
        $(row).find('span.list-left').each(async function(j, pricel) {
            if ('undefined' !== typeof pricel && pricel) {

                let price_left = await $(pricel).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
                //console.log("price_left===  " + price_left) ;

                price_left = Number.parseInt(price_left);
                if (isNaN(price_left) || !isFinite(price_left)) {
                    price_left = 0;
                }
                r.pl.push(price_left);
                //r.prices.get('price_left').push(price_left);
            }
        });

        //right
        $(row).find('span.list-right').each(async function(k, pricer) {
            if ('undefined' !== typeof pricer && pricer) {
                let price_right = await $(pricer).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g, "").replace(/[^\d\.]/g, '');
                //console.log("price_ritht === " + price_right);
                price_right = Number.parseFloat(price_right);
                if (isNaN(price_right) || !isFinite(price_right)) {
                    price_right = 0.0;
                }
                r.pr.push(price_right);
                //await r.prices.get('price_right').push(price_right);
            }
        });

    });


    //console.log(" plll=="+ JSON.stringify(r.pl));
    //console.log("yes ++left  and right all after ech with promise? ===========not null r======%s",  JSON.stringify(r));
    return r;
}

//const parseHtml = async (html) => {
async function getRows(rows) {
    let $ = await cheerio.load(rows);
    let hrows = $('tr').toArray();
    let res = [];

    await hrows.map(async(row) => {
        r = await parseRow($, row)
            //console.log("=========loopppp row=", JSON.stringify(r));
        res.push(r);
    });

    // console.log("now in parseHtml function get resturl rowsres=", res);
    return res;
}


async function getByKeyword(keyword) {

    let result = { status: 1, keyword: keyword, data: undefined };
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
            'proxy-server': proxyIp.proxyip.toString(), // set the proxy server here ...
            'ignore-certificate-errors': true,
            errors
        },
        webPreferences: {
            images: false
        },
        show: false
    });

    //not using da xiang proxy ip
    //console.log("Debug mode not undefinedneed proxy.")
    //nightmare = Nightmare({ show: false });


    var url = "http://www.oemstrade.com/search/" + keyword;


    /*
    await nightmare
    .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
    .goto('http://www.oemstrade.com')
    //.type('#part', '2222')
    .type('#part', keyword)
    .click('button.search-button')
    .wait('#list1545  tbody')
    .evaluate(function () {
        //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
        //return document.querySelector('#list1545 tbody').innerText;
        return document.querySelector('#list1545 tbody').innerHTML;
    })
    .end()
    */


    await nightmare
        .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
        .goto(url)

    //.type('#part', keyword)
    //.click('button.search-button')
    .wait('#list1545  tbody')
        .evaluate(function() {
            //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
            //return document.querySelector('#list1545 tbody').innerText;
            return document.querySelector('#list1545 tbody').innerHTML;
        })
        .end()
        .then((rows) => {
            //content = await parseHtml(html);
            // console.log('get html==== rows =' + rows);
            durT = moment().unix() - startT;
            console.log("get rows spendxxx" + durT);


            getRows(rows)
                .then(data => {
                    durT = moment().unix() - startT;
                    console.log("nightmare request after parset Html Rows. spendxxx" + durT);
                    // console.log("after paserHtml content ===" + JSON.stringify(data));

                    //console.log("nightmare request spendxxx")
                    result.status = 0;
                    result.data = data;
                });

        }).catch((e) => {
            console.error(e);
        });

    //   }catch(e) {
    //       console.error(e);
    //       return {status: 1, keyword: keyword, data: undefined};
    //   }

    console.log("====================after await get result=" + JSON.stringify(result));

    durT = moment().unix() - startT;
    console.log("nightmare request spendxxx" + durT);
    return result;


}

async function crawlerUrls(keywords) {
    let data = [];
    await keywords.map(async(keyword) => {
        res = await getByKeyword(keyword);
        data.push(res);
    });
    return data;
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
