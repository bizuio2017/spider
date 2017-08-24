var express = require('express');
var router = express.Router();
let proxM = require('../controllers/getProxyIps');

/* GET users listing. */
router.get('/', async function(req, res, next) {


  var data = await proxM.getProxyIps()

  res.send(await JSON.stringify(data))

  // res.send('respond with a resource');
});

module.exports = router;
