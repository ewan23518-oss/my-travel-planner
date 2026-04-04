const https = require('https');

const AMAP_KEY = 'a006dc6730859997a2fc9167c053e566';
const CITY = '庆阳'; // 贴合你的截图，换成庆阳

// 高德 API 封装
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

// 1. 获取坐标
async function getCoordinates(address) {
    const res = await fetchAmap('/v3/geocode/geo', { address: address, city: CITY });
    if (res.status === '1' && res.geocodes && res.geocodes.length > 0) {
        return res.geocodes[0].location; 
    }
    return null;
}

// 2. 获取详细的公交/公共交通路线
async function getDetailedTransitRoute(origin, destination) {
    const res = await fetchAmap('/v3/direction/transit/integrated', {
        origin: origin,
        destination: destination,
        city: CITY,
        strategy: '0' // 0：最快捷模式
    });
    
    if (res.status === '1' && res.route && res.route.transits.length > 0) {
        const transit = res.route.transits[0];
        let routeDetails = [];
        
        // 遍历路段，提取具体的乘坐说明（地铁、公交线）
        if (transit.segments) {
            transit.segments.forEach(seg => {
                if (seg.bus && seg.bus.buslines && seg.bus.buslines.length > 0) {
                    const line = seg.bus.buslines[0];
                    routeDetails.push(`乘坐 ${line.name} (途径 ${line.via_num} 站)`);
                }
            });
        }

        return {
            durationMinutes: Math.ceil(transit.duration / 60),
            cost: transit.cost ? parseFloat(transit.cost) : 0,
            distanceKm: (transit.distance / 1000).toFixed(1),
            walkingDistance: transit.walking_distance,
            instructions: routeDetails.length > 0 ? routeDetails.join(' ➔ ') : '直达或仅需步行'
        };
    }
    return null;
}

// 3. 模拟前端需要的 JSON 数据结构（用于在预算下面新建框）
async function generateTransitCardData(fromName, toName) {
    console.log(`正在请求高德 API 获取详细公共交通: [${fromName}] 到 [${toName}]...`);
    
    const locFrom = await getCoordinates(fromName);
    const locTo = await getCoordinates(toName);

    if (!locFrom || !locTo) {
        return { error: `无法获取 ${fromName} 或 ${toName} 的坐标` };
    }

    const transit = await getDetailedTransitRoute(locFrom, locTo);
    
    if (!transit) {
        return { error: '未查找到合适的公共交通方案，建议打车。' };
    }

    // 组装成前端可以直接渲染卡片的 JSON
    return {
        cardTitle: "公共交通出行指引",
        route: `${fromName} ➔ ${toName}`,
        summary: `全程约 ${transit.distanceKm} 公里 | 耗时约 ${transit.durationMinutes} 分钟 | 步行 ${transit.walkingDistance} 米`,
        ticketCost: `约 ¥${transit.cost}`,
        detailedSteps: transit.instructions
    };
}

// 执行测试 (按照截图场景：庆阳西峰机场 -> 全季酒店)
async function main() {
    console.log("=== 生成“公共交通指引卡片”数据 ===");
    const data = await generateTransitCardData("庆阳西峰机场", "庆阳全季酒店(西峰商业街店)");
    
    console.log("\n=== 传给前端用于渲染新框的 JSON 数据 ===");
    console.log(JSON.stringify(data, null, 2));
    
    console.log("\n=== 前端渲染出的 UI 效果预览 ===");
    console.log(`
╭──────────────────────────────────────────────╮
│ 🚌 公共交通出行指引                          │
├──────────────────────────────────────────────┤
│ 📍 庆阳西峰机场 ➔ 庆阳全季酒店(西峰商业街店) │
│                                              │
│ ⏱️ 全程约 ${data.distanceKm || '--'} 公里 | 耗时 ${data.durationMinutes || '--'} 分钟          │
│ 🚶 步行距离: ${data.walkingDistance || '--'} 米 | 预估票价: ¥${data.cost || '--'}          │
│                                              │
│ 【乘车方案】                                 │
│ 路线：${data.detailedSteps || '暂无数据'}                    │
╰──────────────────────────────────────────────╯
    `);
}

main().catch(console.error);