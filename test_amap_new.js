const https = require('https');

const AMAP_KEY = 'a006dc6730859997a2fc9167c053e566';

function testGeocode() {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent('大雁塔')}&city=${encodeURIComponent('西安')}&key=${AMAP_KEY}`;
    console.log("Request URL:", url);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log("Response:", data));
    });
}

testGeocode();