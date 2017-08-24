
var moment = require("moment");

var httpM = require("../controllers/request");


const testCrawler = async() => {
   try { 
    let seeds = new Map();
    seeds.set('2222', '10.8.11.240:8100');
    seeds.set('TP18', '10.8.11.240:8100');


    start = moment.unix();

    for( i=0; i< 10; i++) {

        for( let [key, value] of seeds ) {    
            await  httpM.crawlerKeyword(key);
        }
        
    }

    end = moment.unix();
    const dur = await end -start;
    console.log("finish all testing... time skip");
   }catch(e) {
       console.error(e);
   } 
}

  testCrawler();