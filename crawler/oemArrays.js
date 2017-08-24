var Nightmare = require('nightmare');
var Promise = require("bluebird");
let cheerio = require("cheerio");

//var nightmare = Nightmare({
  //  switches: {
   //     proxy: 'http://183.157.176.151:80',
    //    proxyType: 'http',
////      proxyAuth : 'user:password'
 //  },
//   show: false });

let baseurl = 'http://www.oemstrade.com';
let keywords = ['2222', 'LP18'];
let finalRes = new Map([['2222', []], ['LP18', []]]);



async function parseRow($, key, row) {
	//remove \r\n and space with str replace
        let part =  $(row).find('td.td-part-number').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
	//let pro_maf = $(row).find('td.td-distributor-name').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
	let pro_maf = $(row).find('td.td-distributor-name').text().trim();
	//let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
	let description = $(row).find('td.td-description').text().trim().replace(/\s+/g, "");
	//let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
	let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");


	let r = {part:{}, stock: {}, prices : new Map()};
	r.part = part;
	r.pro_maf = pro_maf;
	r.description = description;
	r.stock = stock;

    
        let pl = [];
        let pr = [];
	     $(row).find('td.td-price ').each(function(i, elem) {
		
		//let price_left = $(row).find('span.list-left').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
		 $(row).find('span.list-left').each(function(j, pricel) {
                   if( 'undefined' !==  typeof pricel && pricel ){ 
                       
		       let price_left = $(pricel).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
		       console.log("price_left===  " + price_left) ;
		       pl.push(price_left);
                   }else {
                       console.log("price left undefined");
                   }
                });

               //right
               $(row).find('span.list-right').each(function(k, pricer) {
                  if( 'undefined' !== typeof pricer && pricer) { 
		      let price_right = $(pricer).text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"").replace(/[^\d\.]/g, '');
		      console.log("price_ritht === " + price_right);
		      pr.push(price_right);
                  }else {
                      console.log("price right undefined");
                  }

		});
		       


	});

	r.prices
          .set("price_left", pl)
	  .set("price_right", pr);
        Promise.all(pl, pr, r);

	console.log(" plll=="+ JSON.stringify(pl));
        console.log("yes left  and right all after ech with promise? ===========not null r======%s",  JSON.stringify(r));
        

	//r = await {part: part, stock: stock};

     
    //    console.log("part=%s ", part);
//	console.log("stock=%s ", stock);
       
        finalRes.get(key).push(r);
	return await r
}

async function parseHtml(key, html) {
    let $ = cheerio.load(html);
  
    let rows = $('tr').toArray();
    let rowres = [];
    const promiseArray = rows.map(async (row) => {
		r = await parseRow($, key, row)
		//console.log("=========loopppp row=", JSON.stringify(r));
		return await r;
	});


		
    return Promise.all(promiseArray);
} 


async function getByKeyword(keyword) {

try{
  var nightmare = Nightmare({
      switches: {
         //'proxy-server': 'http://:@60.169.78.218:808' // set the proxy server here ...
         //'proxy-server': '60.169.78.218:808',
         'proxy-server': '10.8.11.240:8100',
         'ignore-certificate-errors': true 
      },
     show: false });
  var result = await nightmare
  //.authentication('user','pwd')
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
  .then(function (html) {

    //log html


/*
     rows.map((row) => {
        let part =  $(row).find('td.td-part-number').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
	let stock = $(row).find('td.td-stock').text().trim().replace(/\s+/g, "").replace(/\r\n|\n/g,"");
        parts.push(part);
        console.log("part=%s \n", part);
	console.logl("stock=%s \n", stock);

      });
    
*/
     content = parseHtml(keyword, html).then( (res) => {
          console.log("rows===" + JSON.stringify(res));
          //console.log("html" + res);
          return res;
      }).catch((e) => {
          console.error(e);
          return e;
      });


     //let ps = JSON.stringify(partnumbs);
     //ps = ps.replace(/\r\n|\n/g,"");

     //console.log(ps);
    
     //console.log("stocks = %s \n", JSON.stringify(stocks));

     //return {'keyword': keyword,'result':  html};

     return content;
  })
  .catch(function (error) {
    console.error('Search failed:', error);
	return error;
  });

  ////queue and end the Nightmare instance along with the Electron instance it wraps
  await nightmare.end();
  return  await result;
 } catch(e) {
    console.error(e);
    return {keyword: keyword, result: 'err'};
  }
}

//let finalRes = new Map[['2222', []], ['LP18', []]];
//var keywords = ['2222' ];

async function crawlerUrls(keywords){
    const promises = await keywords.map(async (keyword) => {
        keyRes = await getByKeyword(keyword)
        return keyRes;
    });
    return Promise.all(promises);
}

Promise.all(keywords)
.then( (keys) => {
  return crawlerUrls(keywords)
}).then( (res) => {
	//console.log('key='+res.keyword + 'res=' + res.result);
	//console.log('final========' + res);
	console.log('final========' + JSON.stringify(res));
      
	for (let [key, value] of finalRes.entries()) {

             for(let [k2, v2] of value.entries()) {
		console.log(k2, v2);
		if( k2 === "prices") { 
 	            console.log("final prices-------------------array left==="+ JSON.stringify(v2));
		}

             }

        }
        
}).catch( (err) => {
	console.error(err);
});

