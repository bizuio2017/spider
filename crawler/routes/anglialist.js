var express = require('express');
var router = express.Router();
let moment = require("moment");

let crawlerM = require('../controllers/anglialist');

/* GET users listing. */
router.post('/', async function(req, res, next) {
    //var keyword = req.query.keyword;
     //   console.log('req.quer yi  ====' + keyword);

    var keyword = req.body.keyword;
    console.log('req.body.keyword  =' + keyword);
    //console.log('JSON params.keyword=' + JSON.stringify(req));
    //console.log('JSON params.keyword=' + JSON.parse(req));

    if (typeof keyword !== 'undefined' && keyword) {
        console.log('check =' + keyword);
    } else {
        console.log('check error keyword=' + keyword);
        return res.json({ status: 1, data: [] });
    }
    console.log('req.query.keyword url ==' + keyword);

    //anglialist is query list url
    let q = { keyword: keyword };

    var startT = moment().unix();
    console.log("Now start crawler Router......url time is" + startT);

    //async crawler function should return a promise.
    try {
        let data = await crawlerM.crawler(q);
        //response
        // console.log('final response to http front. ==' + JSON.stringify(data));
        res.json(data);
    } catch (e) {
        console.log("crawler error.")
        console.error(e);
        res.json({ status: 1, data: [] });
    }
});
module.exports = router;
