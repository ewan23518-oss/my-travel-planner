// ==========================================
// 模拟高德 API 返回数据的测试版
// （由于我没有你的真实高德 API Key，这里使用本地 Mock 数据展示核心决策逻辑的运行效果）
// ==========================================

const aiGeneratedItinerary = [
    { name: '钟楼', type: 'attraction' },
    { name: '回民街', type: 'attraction' },
    { name: '西安城墙', type: 'attraction' }
];

// 模拟地理编码：景点名转经纬度
async function getCoordinates(address) {
    const mockDb = {
        '钟楼': '108.94704,34.259439',
        '回民街': '108.942978,34.263884',
        '西安城墙': '108.946465,34.251213'
    };
    return mockDb[address] || '108.000,34.000';
}

// 模拟驾车/打车预估
async function getTaxiRoute(origin, destination) {
    // 钟楼 -> 回民街 (距离近)
    if (origin === '108.94704,34.259439' && destination === '108.942978,34.263884') {
        return { durationMinutes: 6, taxiCost: 9.5, distanceKm: 1.2 };
    }
    // 回民街 -> 西安城墙
    return { durationMinutes: 12, taxiCost: 12.5, distanceKm: 2.5 };
}

// 模拟公交/地铁规划
async function getTransitRoute(origin, destination) {
    // 钟楼 -> 回民街
    if (origin === '108.94704,34.259439' && destination === '108.942978,34.263884') {
        return { durationMinutes: 15, cost: 2, distanceKm: 1.2, walkingDistance: 800 };
    }
    // 回民街 -> 西安城墙
    return { durationMinutes: 18, cost: 2, distanceKm: 2.5, walkingDistance: 650 };
}

// ==========================================
// 3. 核心决策逻辑：打车 vs 地铁
// ==========================================
async function planTrafficBetween(fromName, toName) {
    console.log(`正在规划: [${fromName}] 到 [${toName}]...`);
    
    const locFrom = await getCoordinates(fromName);
    const locTo = await getCoordinates(toName);

    const [taxi, transit] = await Promise.all([
        getTaxiRoute(locFrom, locTo),
        getTransitRoute(locFrom, locTo)
    ]);

    // 决策规则 (舒适标准：打车+地铁)
    if (taxi && taxi.distanceKm < 2.0) {
        return `距离约${taxi.distanceKm}公里，很近，建议直接打车，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）`;
    }

    if (taxi && transit) {
        if ((transit.durationMinutes - taxi.durationMinutes > 15) || taxi.taxiCost <= 15) {
            return `推荐打车前往，约${taxi.durationMinutes}分钟（预估${taxi.taxiCost}元）。若坐地铁约需${transit.durationMinutes}分钟。`;
        } else {
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
    
    let finalOutput = "\n【今日行程交通指南】";
    
    for (let i = 0; i < aiGeneratedItinerary.length - 1; i++) {
        const from = aiGeneratedItinerary[i].name;
        const to = aiGeneratedItinerary[i+1].name;
        
        const suggestion = await planTrafficBetween(from, to);
        finalOutput += `\n\n📍 从 ${from} -> ${to}:\n   👉 ${suggestion}`;
        
        await new Promise(r => setTimeout(r, 800)); 
    }
    
    console.log("\n=== 最终给用户的输出 ===");
    console.log(finalOutput);
}

main().catch(console.error);