let elasticsearch = require('elasticsearch');

let Promise = require('bluebird');

let client = elasticsearch.Client({
  hosts: [
    'http://10.8.15.168:9200'
  ]
});

//var pageNum = request.params.page;
//var perPage = request.params.per_page;
//var userQuery = request.params.search_query;
//var userId = request.session.userId;

module.exports.search = async function(q, callback) {
 console.log('userQuery=' + q.userQuery);
  console.log('pageNum=' + q.pageNum);
  console.log('perPage=' + q.perPage);

  if( q.pageNum <1) q.pageNum = 1;

  client.search({
    index: 'ickey',
    type: 'product',
    from: (q.pageNum - 1) * q.perPage,
    size: q.perPage,
    body: {
      query: {
        bool: {
          must: {
            match: {
              "p": q.userQuery
            }
          }
        }
      }
    }
  }).then(function (resp) {
    console.log(resp.hits.total);
    console.log(q.pageNum);
    console.log(q.pageNum);
    //console.log(Math.ceil(res.hits.total /q.perPage));
    //console.log(Math.ceil(res.hits.total /q.perPage));
    r = {result: resp.hits.hits,
            page: q.pageNum};
            //pages: Math.ceil(res.hits.total /q.perPage) }; 
           // pages: (res.hits.total /q.perPage) }; 

    console.log("sexxxch result=" +JSON.stringify(r));
 
    callback(r);
    return r;
  }).catch( (err) => {
      console.log(err.message);
      callback(err.message)
  });
}

