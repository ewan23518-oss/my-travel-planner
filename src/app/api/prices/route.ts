import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departDate = searchParams.get('departDate') || new Date().toISOString().split('T')[0];
  const returnDate = searchParams.get('returnDate') || new Date().toISOString().split('T')[0];
  const origin = searchParams.get('origin') || 'BJS'; 
  const destination = searchParams.get('destination') || 'SHA'; 

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY 未配置' }, { status: 500 });
  }

  const modelName = 'gemini-3-flash-preview';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  // 自动判断代理
  const proxyUrl = process.env.PROXY_URL || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7897' : null);
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  const promptText = `你现在是一个实时价格查询 API。你需要根据 ${origin} 到 ${destination} 的真实情况（去程 ${departDate}，回程 ${returnDate}），以及 ${destination} 的真实酒店价格。
请尽量使用搜索工具获取当前真实的机票和酒店信息，不要虚构！酒店请根据以下标准推荐：经济型 (100-300元)，舒适/四星 (300-600元)，豪华/五星 (800元以上)。

请严格返回 JSON，结构如下要求，不要有任何多余文本：
{
  "flights": [
    {
      "airline": "例如 中国东方航空",
      "time": "去程起飞时间，例如 08:30",
      "returnTime": "回程起飞时间，例如 16:20（如果是单程则为 待定）",
      "ecoPrice": 1200,
      "firstPrice": 3500,
      "numPrice": 1200,
      "type": "单程" 或 "往返",
      "tag": "特价" 或 "推荐",
      "flight_number": "航班号，例如 MU5101",
      "isLCC": false,
      "departDateStr": "${departDate}",
      "returnDateStr": "${returnDate}"
    }
  ],
  "hotels": [
    {
      "name": "真实酒店名称",
      "rating": "4.8",
      "price": "￥450",
      "numPrice": 450,
      "desc": "位置描述",
      "tag": "舒适商旅",
      "category": "经济型" 或 "舒适/四星" 或 "豪华/五星"
    }
  ]
}

要求提供 3 班航班和 5 家酒店。确保返回的酒店价格段覆盖齐全，特别是舒适/四星级的价格应在 300-600 元之间。`;

  try {
    const fetchOptions: any = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: '你是一个严格的 API 路由器，你只能返回结构良好的 JSON 文本，不要带有 markdown 标签。' }]
        },
        contents: [
          { role: 'user', parts: [{ text: promptText }] }
        ],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json",
        }
      })
    };

    if (proxyAgent) {
      fetchOptions.agent = proxyAgent;
    }

    const response = await fetch(apiUrl, fetchOptions);

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Gemini API 报错:', data);
      throw new Error(data.error?.message || '调用 Gemini 模型失败');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    let parsedData;
    try {
      let cleanText = responseText;
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON 解析失败:", responseText);
      throw new Error("AI 返回的价格数据格式无法解析");
    }

    return NextResponse.json({ 
      success: true, 
      flights: (parsedData.flights || []).map((f: any) => ({
        ...f,
        airline: typeof f.airline === 'object' ? (f.airline.name || JSON.stringify(f.airline)) : String(f.airline),
        time: typeof f.time === 'object' ? (f.time.departure || JSON.stringify(f.time)) : String(f.time),
        flight_number: typeof f.flight_number === 'object' ? (f.flight_number.id || JSON.stringify(f.flight_number)) : String(f.flight_number),
        tag: typeof f.tag === 'object' ? JSON.stringify(f.tag) : String(f.tag)
      })),
      hotels: (parsedData.hotels || []).map((h: any) => ({
        ...h,
        name: typeof h.name === 'object' ? (h.name.full || JSON.stringify(h.name)) : String(h.name),
        rating: typeof h.rating === 'object' ? (h.rating.value || JSON.stringify(h.rating)) : String(h.rating),
        desc: typeof h.desc === 'object' ? (h.desc.text || JSON.stringify(h.desc)) : String(h.desc),
        tag: typeof h.tag === 'object' ? JSON.stringify(h.tag) : String(h.tag),
        category: typeof h.category === 'object' ? JSON.stringify(h.category) : String(h.category)
      })),
      updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

  } catch (error: any) {
    console.error("Fetch prices error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch prices' }, { status: 500 });
  }
}
