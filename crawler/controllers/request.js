
var request = require('axios');
var Promise = require('bluebird');

module.exports.crawlerKeyword = async (keyword) => {
  try {
    const url = '127.0.0.1:3000/crawler?keyword=' + keyword;
     request.get(url)
    .then( data => {
        return data;
    }).catch( e => {
        return {status:1, e:e};
    });
  }catch(e) {
	 console.error('axios err' + e);
     return {status: 1, e: e};
  }
  ////////////////////end module
}
