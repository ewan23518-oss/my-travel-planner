import { NextResponse } from 'next/server';
import { TripInput, TripResult } from '@/lib/types';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const input: TripInput = await req.json();

    if (!input.destination) {
      return NextResponse.json({ error: '目的地不能为空' }, { status: 400 });
    }

    const modelName = 'gemma-4-31b-it';

    if (!apiKey) {
      return NextResponse.json({ error: 'API KEY 未配置' }, { status: 500 });
    }
    
    const promptText = `
你是一个顶级的旅行规划AI，你的任务是根据用户要求，返回一个结构完整、数据准确的JSON。
**用户要求:**
- 目的地: ${input.destination}
- 出发日期: ${input.startDate}
- 天数: ${input.days}
- 出发地: ${input.departure || '未指定'}
- 预算等级: ${input.budget} (如果是 economy 则推荐 100-300 元的青旅或便捷酒店，如果是 standard 则推荐 300-600 元的 4 星或舒适型酒店，如果是 luxury 则推荐 800 元以上的 5 星或豪华度假村)
- 人数: ${input.companions}
- 旅行风格: ${input.style}
- 额外备注: ${input.extraNotes || '无'}

**核心规划逻辑 (必须严格遵守):**
1. **天数与景点适配**: 
   - 如果天数少 (1-2天)，强制只选择该城市最顶级的地标景点，确保行程最精华。
   - 如果天数多 (3天以上)，加入次级热门景点或深度体验点。
2. **CityWalk 风格约束**: 
   - 只有在风格是 'citywalk' 时，才执行此项：全天兴趣点必须在地理上高度集中（严禁跨区），任意相邻点步行距离绝对不能超过 2 公里。所有 transitRoutes 的 mode 必须是 walking。
3. **常规交通逻辑**: 
   - 风格不是 citywalk 时，根据城市交通现状合理安排公交、地铁或网约车。
4. **美食探索 (Food Focus)**: 
   - 如果风格是 'food'，行程必须体现“以吃为本”，**全天候、多频次地推荐美食**：
   - **全天候覆盖**: 每天 activities 必须包含：1个特色早餐/早茶、1个地道正餐、以及 **至少 2 个** 不同的【下午茶/奶茶/甜品点】或【特色小吃打卡位】。
   - **丰富推荐池**: 在 \`foodCoffeeRecommendations\` 数组中，必须列出 **至少 5-8 个** 该区域内的备选美食、网红店、宝藏奶茶或咖啡店，提供充足的选择空间。
   - **深度描述**: 在 description 中必须包含【必点菜品】、【口味特色】及【打卡攻略】。
   - **美食布局**: 景点之间的转场应尽量安排在有高分评价餐饮店的路线上。
5. **商圈化规划**: 
   - 如果行程涉及购物，必须以“商圈”为单位罗列多个核心商场（例如：后海商圈需同时提及海岸城、深圳湾万象城、后海汇）。
6. **亲子游玩专项 (Family Travel)**:
   - 如果风格是 'family'，行程必须体现“低强度、高趣味、多配套”：
   - **节奏控制**: 每天 activities 严禁超过 3 个，且必须包含一个明显的“午休/自由活动”时段。
   - **选址偏好**: 优先选择带有儿童乐园、互动体验、自然科普或母婴设施完善的场所。
   - **家长贴士**: 在 description 中必须包含针对家长的实用建议（如：是否适合推车、是否有母婴室、是否有儿童餐）。
   - **交通**: 尽量避开高峰期拥挤的地铁，推荐更舒适的打车或专车。
7. **地理聚类**: 每一天的行程点必须在地理位置上聚类，严禁跨城折返跑。

**输出格式要求:**
你必须返回一个严格的 JSON 对象。结构如下:
{
  "overview": "不少于100字的行程亮点描述。",
  "budgetBreakdown": { "transport": 100, "hotel": 200, "food": 150, "tickets": 80, "others": 50, "total": 580, "currency": "CNY" },
  "dailyPlans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "...",
      "foodCoffeeRecommendations": ["推荐1", "推荐2"],
      "activities": [
        {
          "id": "act-1", "time": "10:00", "title": "...", "description": "...", "location": "...", "coordinates": [116.3, 39.9], "costEstimation": 50, "type": "attraction"
        }
      ],
      "dailyTransitSummary": { "overviewRoute": "A -> B -> C", "totalEstimatedDuration": "2小时", "totalPublicTransitCost": 30, "medianRideHailingCost": 80 },
      "transitRoutes": [
        { "id": "t-1", "from": "A", "to": "B", "mode": "subway", "instructions": "乘坐X号线...", "estimatedDuration": "20min", "costEstimation": 5, "rideHailingCost": 20 }
      ]
    }
  ]
}
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const proxyUrl = process.env.PROXY_URL || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7897' : null);
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    const fetchOptions: any = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      agent: proxyAgent,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: '你是一个顶级的地理美食旅行专家。你必须且只能返回一个合法的 JSON 对象。1. 必须根据天数合理筛选必去景点，短途精华，长途深度。2. 只有 CityWalk 风格需严格限制 2km 步行；其他风格应推荐公交、地铁或网约车。3. 购物规划必须以“商圈”为核心。4. **美食探索**：必须体现以吃为本（多频次推荐），包含早餐、正餐、多个下午茶/奶茶，并提供 5-8 个备选美食推荐池。建议包含必点菜和打卡贴士。5. **亲子游玩 (Family)**：必须体现低强度节奏（每天≤3个点）、包含家长实用建议（推车/母婴室等）、优先选择儿童友好场所。6. 严禁输出任何 Markdown 标记。' }]
        },
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json",
          max_output_tokens: 8192
        }
      })
    };

    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`尝试生成 ${input.destination} 攻略 (尝试次数: ${i + 1})...`);
        const response = await fetch(apiUrl, fetchOptions);
        
        if (response.ok) {
          const data: any = await response.json();
          let responseText = data.candidates[0].content.parts[0].text;
          
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
          }
          responseText = responseText.replace(/,\s*([\]}])/g, '$1'); 

          const parsedData = JSON.parse(responseText);

          const result: TripResult = {
            id: `trip-${Date.now()}`,
            destination: typeof parsedData.destination === 'string' ? parsedData.destination : input.destination,
            days: Number(parsedData.days) || input.days,
            style: parsedData.style || input.style,
            overview: parsedData.overview || `为您定制的 ${input.destination} 之旅。`,
            dailyPlans: (Array.isArray(parsedData.dailyPlans) ? parsedData.dailyPlans : []).map((day: any) => ({
              day: Number(day.day) || 0,
              date: String(day.date || ''),
              title: String(day.title || ''),
              foodCoffeeRecommendations: Array.isArray(day.foodCoffeeRecommendations) ? day.foodCoffeeRecommendations.map(String) : [],
              activities: (Array.isArray(day.activities) ? day.activities : []).map((act: any) => ({
                id: String(act.id || `act-${Math.random()}`),
                time: String(act.time || ''),
                title: String(act.title || ''),
                description: String(act.description || ''),
                location: String(act.location || ''),
                coordinates: Array.isArray(act.coordinates) ? act.coordinates.map(Number) : [0, 0],
                costEstimation: Number(act.costEstimation) || 0,
                type: String(act.type || 'attraction') as any
              })),
              dailyTransitSummary: {
                overviewRoute: String(day.dailyTransitSummary?.overviewRoute || ''),
                totalEstimatedDuration: String(day.dailyTransitSummary?.totalEstimatedDuration || ''),
                totalPublicTransitCost: Number(day.dailyTransitSummary?.totalPublicTransitCost) || 0,
                medianRideHailingCost: Number(day.dailyTransitSummary?.medianRideHailingCost) || 0
              },
              transitRoutes: (Array.isArray(day.transitRoutes) ? day.transitRoutes : []).map((tr: any) => ({
                id: String(tr.id || `t-${Math.random()}`),
                from: String(tr.from || ''),
                to: String(tr.to || ''),
                mode: String(tr.mode || 'subway') as any,
                instructions: String(tr.instructions || ''),
                estimatedDuration: String(tr.estimatedDuration || ''),
                costEstimation: Number(tr.costEstimation) || 0,
                rideHailingCost: Number(tr.rideHailingCost) || 0
              }))
            })),
            budgetBreakdown: {
              transport: Number(parsedData.budgetBreakdown?.transport) || 0,
              hotel: Number(parsedData.budgetBreakdown?.hotel) || 0,
              food: Number(parsedData.budgetBreakdown?.food) || 0,
              tickets: Number(parsedData.budgetBreakdown?.tickets) || 0,
              others: Number(parsedData.budgetBreakdown?.others) || 0,
              total: Number(parsedData.budgetBreakdown?.total) || 
                     (Number(parsedData.budgetBreakdown?.transport || 0) + 
                      Number(parsedData.budgetBreakdown?.hotel || 0) + 
                      Number(parsedData.budgetBreakdown?.food || 0) + 
                      Number(parsedData.budgetBreakdown?.tickets || 0) + 
                      Number(parsedData.budgetBreakdown?.others || 0)),
              currency: String(parsedData.budgetBreakdown?.currency || 'CNY')
            },
            createdAt: new Date().toISOString()
          };

          return NextResponse.json({ success: true, data: result });
        }

        const data: any = await response.json();
        const errorMsg = data.error?.message || '';
        if (response.status === 429 || response.status === 503 || errorMsg.includes('high demand')) {
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 5000));
          continue;
        }
        throw new Error(errorMsg || `API 请求失败 (Status: ${response.status})`);

      } catch (err: any) {
        lastError = err;
        console.error(`第 ${i+1} 次尝试失败:`, err.message);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
      }
    }

    throw lastError;

  } catch (error: any) {
    console.error('Final API Error:', error);
    let safeMessage = error.message || '服务器内部错误';
    if (apiKey) { safeMessage = safeMessage.replace(apiKey, 'REDACTED_API_KEY'); }
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}