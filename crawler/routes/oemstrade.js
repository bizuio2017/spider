var express = require('express');
var router = express.Router();
let moment = require("moment");

let crawlerM = require('../controllers/oemstrade');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var keyword = req.query.keyword;

    if (typeof keyword !== 'undefined' && keyword) {
        //console.log('check =' + keyword);
    } else {
        console.log('check error keyword=' + keyword);
        return res.json({ status: 1, data: [] });
    }
    console.log('req.query.keyword url path param, keyword=' + keyword);

    let q = { keyword: keyword };


    var startT = moment().unix();
    console.log("Now start crawler Router......url time is" + startT);

    //async crawler function should return a promise.
    try {
        crawlerM.crawler(q)
            .then((data) => {
                console.log('after crawler response ==' + data);
                return data;
            })
            // .then((data) => {
            //     //save to redis
            //     console.log('after save to redis. ==' +data);
            //     return data;
            // })
            .then((data) => {
                //response
                console.log('final response to http front. ==' + JSON.stringify(data));
                res.json(data);
            }).catch(e => {
                console.log("call crawlerM error +" + err);
            });

    } catch (e) {
        console.log("crawler error.")
        console.error(e);
        res.json({ status: 1, data: [] });
    }
});
module.exports = router;