var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  let json = {hello: 'hello', world: 'world', key: 'ak47'};
  res.json(json);
});

module.exports = router;
