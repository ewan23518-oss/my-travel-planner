const https = require('https');
const AMAP_KEY = 'a006dc6730859997a2fc9167c053e566';
const CITY = '庆阳';

function fetchAmap(pathname, params) {
    params.key = AMAP_KEY;
    const urlParts = [];
    for (const k in params) {
        urlParts.push(`${k}=${encodeURIComponent(params[k])}`);
    }
    const finalUrl = `https://restapi.amap.com${pathname}?${urlParts.join('&')}`;
    return new Promise((resolve, reject) => {
        https.get(finalUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function getCoordinates(address) {
    const res = await fetchAmap('/v3/geocode/geo', { address: address, city: CITY });
    if (res.status === '1' && res.geocodes && res.geocodes.length > 0) return res.geocodes[0].location; 
    return null;
}

async function getDetailedTransitRoute(origin, destination) {
    const res = await fetchAmap('/v3/direction/transit/integrated', {
        origin: origin, destination: destination, city: CITY, strategy: '0'
    });
    
    if (res.status === '1' && res.route && res.route.transits.length > 0) {
        const transit = res.route.transits[0];
        let routeDetails = [];
        if (transit.segments) {
            transit.segments.forEach(seg => {
                if (seg.bus && seg.bus.buslines && seg.bus.buslines.length > 0) {
                    const line = seg.bus.buslines[0];
                    routeDetails.push(`乘坐 ${line.name.split('(')[0]} (乘 ${line.via_num} 站)`);
                }
            });
        }
        return {
            durationMinutes: Math.ceil(transit.duration / 60),
            cost: transit.cost ? parseFloat(transit.cost) : 1,
            distanceKm: (transit.distance / 1000).toFixed(1),
            walkingDistance: transit.walking_distance,
            instructions: routeDetails.length > 0 ? routeDetails.join(' ➔换乘➔ ') : '直达或仅需步行'
        };
    }
    return null;
}

async function main() {
    console.log("=== 正在请求真实数据... ===");
    const locFrom = await getCoordinates("庆阳西峰机场");
    const locTo = await getCoordinates("庆阳全季酒店(西峰商业街店)");
    const data = await getDetailedTransitRoute(locFrom, locTo);
    
    console.log(`
╭──────────────────────────────────────────────╮
│ 🚌 详细公共交通指引 (可直接嵌入UI新框)       │
├──────────────────────────────────────────────┤
│ 📍 庆阳西峰机场 ➔ 庆阳全季酒店(商业街店)   │
│                                              │
│ ⏱️ 全程约 ${data.distanceKm} 公里 | 耗时 ${data.durationMinutes} 分钟           │
│ 🚶 步行距离: ${data.walkingDistance} 米 | 预估票价: ¥${data.cost}               │
│                                              │
│ 【乘车方案】                                 │
│ 👉 ${data.instructions}         │
╰──────────────────────────────────────────────╯
    `);
}
main();