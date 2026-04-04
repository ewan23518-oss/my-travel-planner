const https = require('https');

// ==========================================
// 真实高德 Web 服务 API 密钥配置
// ==========================================
const AMAP_KEY = 'a006dc6730859997a2fc9167c053e566';
const CITY = '西安';

// ==========================================
// 1. AI 生成的骨架行程 (Day 1)
// ==========================================
const aiGeneratedItinerary = [
    { name: '大雁塔', type: 'attraction' },
    { name: '陕西历史博物馆', type: 'attraction' },
    { name: '钟楼', type: 'attraction' }
];

// ==========================================
// 2. 高德 API 封装 (Web 服务 API)
// ==========================================
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

// 地理编码：景点名转经纬度
async function getCoordinates(address) {
    const res = await fetchAmap('/v3/geocode/geo', {
        address: address,
        city: CITY
    });
    if (res.status === '1' && res.geocodes && res.geocodes.length > 0) {
        return res.geocodes[0].location; 
    }
    return null;
}

// 驾车/打车预估
async function getTaxiRoute(origin, destination) {
    const res = await fetchAmap('/v3/direction/driving', {
        origin: origin,
        destination: destination
    });
    if (res.status === '1' && res.route && res.route.paths.length > 0) {
        const path = res.route.paths[0];
        return {
            durationMinutes: Math.ceil(path.duration / 60),
            taxiCost: res.route.taxi_cost ? parseFloat(res.route.taxi_cost) : 0,
            distanceKm: (path.distance / 1000).toFixed(1)
        };
    }
    return null;
}

// 公交/地铁规划
async function getTransitRoute(origin, destination) {
    const res = await fetchAmap('/v3/direction/transit/integrated', {
        origin: origin,
        destination: destination,
        city: CITY,
        strategy: '0'
    });
    if (res.status === '1' && res.route && res.route.transits.length > 0) {
        const transit = res.route.transits[0];
        return {
            durationMinutes: Math.ceil(transit.duration / 60),
            cost: transit.cost ? parseFloat(transit.cost) : 0,
            distanceKm: (transit.distance / 1000).toFixed(1),
            walkingDistance: transit.walking_distance
        };
    }
    return null;
}

// ==========================================
// 3. 核心决策逻辑：打车 vs 地铁
// ==========================================
async function planTrafficBetween(fromName, toName) {
    console.log(`正在请求高德 API 规划: [${fromName}] 到 [${toName}]...`);
    
    const locFrom = await getCoordinates(fromName);
    const locTo = await getCoordinates(toName);

    if (!locFrom || !locTo) {
        return `无法获取准确坐标，建议查阅地图前往 ${toName}`;
    }

    const [taxi, transit] = await Promise.all([
        getTaxiRoute(locFrom, locTo),
        getTransitRoute(locFrom, locTo)
    ]);

    if (!taxi && !transit) return `暂未获取到推荐路线，建议查阅地图。`;

    if (taxi && taxi.distanceKm < 2.0) {
        return `距离约${taxi.distanceKm}公里，很近，建议直接打车，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）`;
    }

    if (taxi && transit) {
        if ((transit.durationMinutes - taxi.durationMinutes > 15) || taxi.taxiCost <= 15) {
            return `推荐打车前往，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）。若坐地铁约需${transit.durationMinutes}分钟。`;
        } else {
            return `推荐乘坐地铁/公交，约需${transit.durationMinutes}分钟（步行约${transit.walkingDistance}米）。打车需花费约${taxi.taxiCost}元。`;
        }
    }
    return `建议打车前往，约${taxi ? taxi.durationMinutes : '--'}分钟`;
}

// ==========================================
// 4. 执行主流程
// ==========================================
async function main() {
    console.log("=== 高德真实 API 路线规划自动执行系统启动 ===");
    console.log("路线节点:", aiGeneratedItinerary.map(i => i.name).join(" -> "));
    
    let finalOutput = "\n【今日行程交通指南 (基于高德真实数据)】";
    
    for (let i = 0; i < aiGeneratedItinerary.length - 1; i++) {
        const from = aiGeneratedItinerary[i].name;
        const to = aiGeneratedItinerary[i+1].name;
        
        try {
            const suggestion = await planTrafficBetween(from, to);
            finalOutput += `\n\n📍 从 ${from} -> ${to}:\n   👉 ${suggestion}`;
        } catch (err) {
            finalOutput += `\n\n📍 从 ${from} -> ${to}:\n   👉 规划失败: ${err.message}`;
        }
        
        // 延时防止触发并发限制
        await new Promise(r => setTimeout(r, 800)); 
    }
    
    console.log("\n=== 最终给用户的输出 ===");
    console.log(finalOutput);
}

main().catch(console.error);