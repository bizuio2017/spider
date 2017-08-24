var axios = require('axios');
var Promise = require('bluebird');


module.exports.getHtml = async(url) => {
    var result = { proxyip: {}, found: false };

    try {
        // const url = 'http://tvp.daxiangdaili.com/ip/?' + config.daxiang.params;  
        //const url = 'http://tvp.daxiangdaili.com' + '/ip/?tid=555040800113736&num=1&foreign=only';

        //IN FIREWALL
        // const url = 'http://tvp.daxiangdaili.com' + '/ip/?tid=555040800113736&num=1';

        //const url = 'http://tvp.daxiangdaili.com' + '/ip/?tid=555040800113736&num=1&foreign=only&category=2&longlife=10';

        //get ips from daxiang api.
        await axios({
                method: 'GET',
                url: url,
                proxy: {
                    host:
                }

            })
            .then(res => {
                //console.log("get proxy ip===" + res.data);
                //let sip = JSON.parse(res.data);
                //console.log("get proxy ip===" + sip);
                result.proxyip = res.data;
                result.found = true;

                console.log("get xxx proxy ip===" + JSON.stringify(result));
            }).catch(e => {
                console.error('axios with catch err' + e);
            });

        return result;
    } catch (e) {
        console.log('get proxy ip err.' + e);
    }

}