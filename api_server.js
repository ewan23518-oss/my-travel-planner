const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

const AMAP_KEY = 'a006dc6730859997a2fc9167c053e566';

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

async function getCoordinates(address, city) {
    const res = await fetchAmap('/v3/geocode/geo', { address: address, city: city });
    if (res.status === '1' && res.geocodes && res.geocodes.length > 0) return res.geocodes[0].location; 
    return null;
}

async function getDetailedTransitRoute(origin, destination, city) {
    const res = await fetchAmap('/v3/direction/transit/integrated', {
        origin: origin, destination: destination, city: city, strategy: '0'
    });
    
    if (res.status === '1' && res.route && res.route.transits.length > 0) {
        const transit = res.route.transits[0];
        let routes = [];
        let routeDetails = [];
        if (transit.segments) {
            transit.segments.forEach(seg => {
                if (seg.bus && seg.bus.buslines && seg.bus.buslines.length > 0) {
                    const line = seg.bus.buslines[0];
                    const name = line.name.split('(')[0];
                    const stops = parseInt(line.via_num) || 0;
                    routes.push({ type: 'bus', name: name, stops: stops });
                    routeDetails.push(`乘坐 ${name} (乘 ${stops} 站)`);
                }
            });
        }
        return {
            durationMinutes: Math.ceil(transit.duration / 60),
            cost: transit.cost ? parseFloat(transit.cost) : 1,
            distanceKm: (transit.distance / 1000).toFixed(1),
            walkingDistance: transit.walking_distance,
            instructions: routeDetails.length > 0 ? routeDetails.join(' ➔换乘➔ ') : '直达或仅需步行',
            routes: routes
        };
    }
    return null;
}

app.get('/api/traffic', async (req, res) => {
    // 默认城市为庆阳，也可以前端传过来
    const { from, to, city = '庆阳' } = req.query;
    
    if (!from || !to) {
        return res.status(400).json({ error: '缺少起点 from 或终点 to 参数' });
    }

    try {
        console.log(`[API Request] 正在查询: ${from} -> ${to} (${city})`);
        
        const locFrom = await getCoordinates(from, city);
        const locTo = await getCoordinates(to, city);

        if (!locFrom || !locTo) {
            return res.status(404).json({ error: '地址无法解析，请检查输入的地名' });
        }

        const data = await getDetailedTransitRoute(locFrom, locTo, city);
        
        if (!data) {
            return res.status(404).json({ error: '未找到直达或推荐的公共交通方案' });
        }

        // 返回给前端的标准 JSON
        res.json({
            status: "success",
            trafficDetails: {
                origin: from,
                destination: to,
                distanceKm: parseFloat(data.distanceKm),
                durationMinutes: data.durationMinutes,
                walkingDistance: parseInt(data.walkingDistance),
                ticketCost: data.cost,
                instructions: data.instructions,
                routes: data.routes
            }
        });
    } catch (err) {
        console.error("API 报错:", err);
        res.status(500).json({ error: '服务端内部错误', details: err.message });
    }
});

const PORT = 3030;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 旅游公交 AI 规划 API 服务已成功启动！`);
    console.log(`✅ 服务端口: http://localhost:${PORT}`);
    console.log(`👉 你的前端可以直接调用啦！跨域 (CORS) 已开启。`);
    console.log(`=============================================`);
    console.log(`[测试接口链接]:`);
    console.log(`http://localhost:${PORT}/api/traffic?from=庆阳西峰机场&to=庆阳全季酒店(西峰商业街店)&city=庆阳`);
});