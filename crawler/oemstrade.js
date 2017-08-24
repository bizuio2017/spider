 var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })

        nightmare
    .useragent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36')
    .goto('http://oemstrade.com')
    .type('#part', '2222')
    .click('#search-form [type=submit]')
    .wait('div[data-distributorname="TTI"] tbody')
    .evaluate(function () {
        //return document.querySelector('#list1545 td.td-part-number a').innerText.replace(/[^\d\.]/g, '');
        //return document.querySelector('#list1545 tbody').innerText;
        return document.querySelector('div[data-distributorname="TTI"] tbody').innerHTML;
    })
    .end()
    .then(function (result) {
        console.log(result)
     })
     .catch(function (error) {
        console.error('Search failed:', error);
     });

