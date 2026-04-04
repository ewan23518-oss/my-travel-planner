const fs = require('fs');
const content = `import { NextResponse } from 'next/server';
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
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY δ����' }, { status: 500 });
  }

  const modelName = 'gemini-3-flash-preview';
  const apiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/\${modelName}:generateContent?key=\${apiKey}\`;
  const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7897');

  const promptText = \`������Ϊʵʱ�������� API������Ҫ�� \${origin} ���� \${destination} ����ʵ���ࣨȥ�� \${departDate}���س� \${returnDate}���Լ��� \${destination} ����ʵ�Ƶ�۸�
�����ʹ���������߻�ȡ��ǰ��ʵ�Ļ�Ʊ�;Ƶ���Ϣ������Ҫ���죡����Ҳ���������Ʊ����ֻ���ص�����ʵ��Ʊ������ type ��Ϊ "����"��returnTime ��Ϊ "����"��

�����ϸ񷵻� JSON���ṹ�������£���Ҫ���������ı�����
{
  "flights": [
    {
      "airline": "���� ��������",
      "time": "ȥ�����ʱ�䣬���� 08:30",
      "returnTime": "�س����ʱ�䣬���� 16:20������ǵ������� ����",
      "ecoPrice": ���òռ۸񣨱��������֣�,
      "firstPrice": ͷ�Ȳռ۸񣨱��������֣�,
      "numPrice": ��������ļ۸񣨵��ھ��òռ۸�,
      "type": "����" �� "����",
      "tag": "�ؼ�" �� "�Ƽ�",
      "flight_number": "����ţ����� MU5101",
      "isLCC": �Ƿ�������������ֵ��,
      "departDateStr": "\${departDate}",
      "returnDateStr": "\${returnDate}"
    }
  ],
  "hotels": [
    {
      "name": "��ʵ�Ƶ�����",
      "rating": "����",
      "price": "��450",
      "numPrice": 450,
      "desc": "λ������",
      "tag": "��ǩ",
      "category": "������" �� "����/����" �� "����/����"
    }
  ]
}

Ҫ���ṩ 3 ������� 5 ���Ƶꡣȷ�����ص�������������ʵ�������������ʵ����š����ʱ�䡢��ʵ�Ƶ����ƣ���\`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: '����һ���ϸ�� API ����ˣ���ֻ�ܷ��ش����� JSON �ı����Ͻ����� markdown ��ǡ�' }]
        },
        contents: [
          { role: 'user', parts: [{ text: promptText }] }
        ],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json",
        }
      }),
      agent: proxyAgent
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Gemini API ����:', data);
      throw new Error(data.error?.message || '���� Gemini ģ��ʧ��');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON ����ʧ��:", responseText);
      throw new Error("AI ���ص����ݸ�ʽ�޷�����");
    }

    return NextResponse.json({ 
      success: true, 
      flights: parsedData.flights || [],
      hotels: parsedData.hotels || [],
      updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

  } catch (error: any) {
    console.error("Fetch prices error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch prices' }, { status: 500 });
  }
}
`;
fs.writeFileSync('C:/home/node/.openclaw/workspace/ai-travel-planner/src/app/api/prices/route.ts', content, 'utf8');
