const fetch = require('node-fetch');
async function test() {
  const t = '1eb7063263a70f60f78c7e7f35748fce';
  const res1 = await fetch(`https://api.travelpayouts.com/v2/prices/latest?currency=cny&origin=BJS&destination=SHA&limit=10&token=${t}`);
  const data1 = await res1.json();
  console.log('v2 latest:', data1.data.slice(0, 3));
  
  const res2 = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?currency=cny&origin=BJS&destination=SHA&token=${t}`);
  const data2 = await res2.json();
  console.log('v1 cheap:', data2.data);
}
test();