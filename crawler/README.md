# how test rest api
#DEBUG=nightmare xvfb-run nod# tools postman

# v0.0.4 features
DEBUG=nightmare xvfb-run node --harmony-async-await bin/www
crawlerT for crawler client.
//10.8.15.9:3000/crawler?keyword=2222
add NODE_ENV  config product.json
fix stock and price number converan and check isNan or isFinite


## docker web app firewall howto

cd /root/go/src/github.com/docker-openresty/centos-rpm
vi Dockerfile
```
fix http in nginx.conf
lua_package_path "/usr/local/nginx/conf/waf/?.lua";
lua_shared_dict limit 10m;
init_by_lua_file  /usr/local/nginx/conf/waf/init.lua;
access_by_lua_file /usr/local/nginx/conf/waf/waf.lua;

```

```
docker build -t ngfirewall -f Dockerfile .

docker run -d -p 80:80 --net=host ngfirewall:latest -v /root/go/src/github.com/docker-openresty/centos-rpm/conf:/usr/local/openresty/nginx/conf

docker rmi -f 3ee53d5a4715  75ca31807466

docker exec -i -t 38057174c4cd /bin/bash



docker cp <containerId>:/file/path/within/container /host/path/target



docker cp db9f83ea8da6:/usr/local/openresty/nginx/conf/ conf
```
## crawler response
```
 {
        "part": "BFC241641004",
        "stock": "11280",
        "pl": [
          "10",
          "50",
          "100",
          "250",
          "500"
        ],
        "pr": [
          "0.9560",
          "0.7220",
          "0.6600",
          "0.6170",
          "0.5920"
        ],
        "pro_maf": "Vishay Intertechnologies",
        "description": "FilmCapacitors.1uF2%63voltsRoHS:Compliant|pbFree:Yes"
      }
```
## search demo
```
search elasticsearch by q keyword example
GET 10.8.15.9:3000/search?page=1&size=20&q=2222
```

## how to crawler one keyword by GET http example.

## How to crawler many keywords by POST request example.


## add dependences
yarn add nightmare
yarn add bluebird
yarn add cheerio


## feauture how to array async loop and with promise all
## run
```
use ES7 async await

node --harmony-async-await bin/www
```
## test

node --harmony-async-await test/reduce.js
node --harmony-async-await test/map.js



## array.reduce not map. async function return a promise then call example code.
var Promise = require("bluebird");
var arr = [1,2,3,4]

const sumf = async ( cur) => {
  return await 2 * cur;
}

console.log("array data===" + arr);

var sums = arr.reduce( async (pre, cur) => {
    const queue= await pre;
    console.log("pre=="+pre);
    console.log("cur=="+cur);
    queue.push(await sumf(cur));

    return queue;
//初始值pre 是为Promise类型，还是整数型根据下面的注射决定
}, Promise.resolve([]));
//}, 0);

  sums.then( data => {
      console.log("result data===" + data);
      console.log("result data===" + JSON.stringify(data));
  })
  .catch( e => console.error(e));

[root@ickey-master test]# node --harmony-async-await reduce.js
pre==[object Promise]
result data===2,4,6,8
result data===[2,4,6,8]

## 如果以上代码
//}, Promise.resolve([]));
}, 0);
初始值为数子0 结果为数组各个元素想家
out
pre==0
result data===10

/////另外注意reduce改为数组元素累积，同步函数。同步完成后可以使用 then
但是数组的map为异步函数，结束循环后不能使用Promise then
异步编程的重要区别.

Xvfb :99 -screen 0 1024x768x24 -extension RANDR -nolisten inet6 &


Xvfb :99 -screen 0 800x600x8 -extension RANDR -nolisten inet6 &

yum install 'gnu-free-sans-fonts'
yum install xorg-x11-server-Xvfb  gtk2 libXtst GConf2 alsa-lib xorg-x11-fonts*
yum install libXScrnSaver.x86_64
yum install libstdc++.so.6

$ export NODE_ENV=production
$ node my-app.js

DEBUG=nightmare xvfb-run node --harmony-async-await bin/www




## docker use

docker build  -t ickeycrawler .
docker run ickeycrawler:latest --rm index.js
