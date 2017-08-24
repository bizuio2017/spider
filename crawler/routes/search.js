var express = require('express');
var router = express.Router();

let searchM = require('../controllers/elastic');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var pageNum = req.query.page;
  var perPage = req.query.size;
  var userQuery = req.query.q;

  //set default params
  if( !(typeof pageNum !== 'undefined' && pageNum)) {
   pageNum = 0;
  } 
  if( typeof perPage !== 'undefined' && perPage) {
    //console.log('check perPage=' + perPage);
  } else { perPage = 20;} 
  if( typeof userQuery !== 'undefined' && userQuery) {
    //console.log('check userQuery=' + userQuery);
  } else { userQuery = '2222';} 

 console.log('xxy userQuery=' + userQuery);
  console.log('xxy pageNum=' + pageNum);
  console.log('xxy perPage=' + perPage);


  let q = {pageNum: pageNum, perPage: perPage, userQuery: userQuery };


  searchM.search(q, function(data) {
    console.log(data);
    res.json({status: 0, data: data});
 });
});

module.exports = router;
