const https = require('https');
const crypto = require('crypto');

const AMAP_KEY = '037cd5541a2c71263f8cb1e732f0a777';
const AMAP_SECRET = '1de0572e5891f1fd71eb523c5febd3f7';

function testGeocode() {
    const params = {
        key: AMAP_KEY,
        address: '大雁塔',
        city: '西安'
    };
    
    const keys = Object.keys(params).sort();
    const sigParts = [];
    for (const k of keys) {
        sigParts.push(`${k}=${params[k]}`);
    }
    const sigString = sigParts.join('&') + AMAP_SECRET;
    const sig = crypto.createHash('md5').update(sigString, 'utf8').digest('hex');
    
    const urlParts = [];
    for (const k of keys) {
        urlParts.push(`${k}=${encodeURIComponent(params[k])}`);
    }
    urlParts.push(`sig=${sig}`);
    
    const url = `https://restapi.amap.com/v3/geocode/geo?${urlParts.join('&')}`;
    console.log("Request URL:", url);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log("Response:", data));
    });
}

testGeocode();