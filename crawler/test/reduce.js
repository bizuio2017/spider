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
}, Promise.resolve([]));
//}, 0);

  sums.then( data => {
      console.log("result data===" + data);
      console.log("result data===" + JSON.stringify(data));
  })
  .catch( e => console.error(e));
