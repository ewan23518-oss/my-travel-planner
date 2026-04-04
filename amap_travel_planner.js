const https = require('https');

// ==========================================
// 配置区域
// ==========================================
const AMAP_KEY = '你的高德Web服务API_Key'; // 替换为你的高德API Key
const CITY = '西安';

// ==========================================
// 1. 模拟大模型生成的骨架行程 (Day 1)
// ==========================================
const aiGeneratedItinerary = [
    { name: '钟楼', type: 'attraction' },
    { name: '回民街', type: 'attraction' },
    { name: '西安城墙', type: 'attraction' }
];

// ==========================================
// 2. 高德 API 封装
// ==========================================
// HTTP GET 辅助函数
function fetchGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

// 地理编码：景点名转经纬度
async function getCoordinates(address) {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&city=${encodeURIComponent(CITY)}&key=${AMAP_KEY}`;
    const res = await fetchGet(url);
    if (res.status === '1' && res.geocodes.length > 0) {
        return res.geocodes[0].location; // 返回格式: "108.94704,34.259439"
    }
    return null;
}

// 驾车/打车预估
async function getTaxiRoute(origin, destination) {
    const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${AMAP_KEY}`;
    const res = await fetchGet(url);
    if (res.status === '1' && res.route.paths.length > 0) {
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
    const url = `https://restapi.amap.com/v3/direction/transit/integrated?origin=${origin}&destination=${destination}&city=${encodeURIComponent(CITY)}&strategy=0&key=${AMAP_KEY}`;
    const res = await fetchGet(url);
    if (res.status === '1' && res.route.transits.length > 0) {
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
    console.log(`正在规划: [${fromName}] 到 [${toName}]...`);
    
    const locFrom = await getCoordinates(fromName);
    const locTo = await getCoordinates(toName);

    if (!locFrom || !locTo) {
        return `建议您查阅地图前往 ${toName}`;
    }

    // 并发请求打车和地铁方案
    const [taxi, transit] = await Promise.all([
        getTaxiRoute(locFrom, locTo),
        getTransitRoute(locFrom, locTo)
    ]);

    // 决策规则 (舒适标准：打车+地铁)
    if (taxi && taxi.distanceKm < 2.0) {
        return `距离约${taxi.distanceKm}公里，很近，建议直接打车，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）`;
    }

    if (taxi && transit) {
        // 如果打车比地铁快15分钟以上，或者打车费低于15元 -> 推荐打车
        if ((transit.durationMinutes - taxi.durationMinutes > 15) || taxi.taxiCost <= 15) {
            return `推荐打车前往，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）。若坐地铁约需${transit.durationMinutes}分钟。`;
        } else {
            // 否则推荐地铁
            return `推荐乘坐公共交通/地铁，约需${transit.durationMinutes}分钟（步行约${transit.walkingDistance}米）。打车需花费约${taxi.taxiCost}元。`;
        }
    }

    return `建议打车前往，约${taxi ? taxi.durationMinutes : '--'}分钟`;
}

// ==========================================
// 4. 执行主流程
// ==========================================
async function main() {
    console.log("=== AI 深度规划自动执行系统启动 ===");
    console.log("获取到 AI 初始行程骨架:", aiGeneratedItinerary.map(i => i.name).join(" -> "));
    
    let finalOutput = "【今日行程交通指南】\n";
    
    for (let i = 0; i < aiGeneratedItinerary.length - 1; i++) {
        const from = aiGeneratedItinerary[i].name;
        const to = aiGeneratedItinerary[i+1].name;
        
        const suggestion = await planTrafficBetween(from, to);
        finalOutput += `\n📍 从 ${from} -> ${to}:\n   👉 ${suggestion}\n`;
        
        // 遵守API频率限制，稍微延时
        await new Promise(r => setTimeout(r, 500)); 
    }
    
    console.log("\n=== 最终给用户的输出 ===");
    console.log(finalOutput);
}

main().catch(console.error);