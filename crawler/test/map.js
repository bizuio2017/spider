var Promise = require("bluebird");

var arr = [1,2,3,4]
const sumf = async ( cur) => {
  return await 2 * cur;
}

console.log("array data===" + arr);


const compf = async (all) => {

  var data = [];
  await all.map( async ( item) => {
    console.log("item =="+ item);
    c = await sumf(item);
    data.push(c);
  });

   console.log("in async function after array and map result is finish?", data);
   
   return data;
}




  compf(arr)
  .then( (result) => {
    console.log("result data===" + result);
    console.log("result data===" + JSON.stringify(result));
  })
  .catch( e => {
    console.log('err ', err);
    c
   });
