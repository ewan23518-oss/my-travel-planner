const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch');

async function test() {
  const apiKey = 'AIzaSyAFuC7ktID9DlWL36s3yEuT4smnvbR9p6Y';
  const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7897');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    agent: proxyAgent,
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: "Find 3 real flight options and 3 real hotel options from Beijing to Shanghai for tomorrow. Return strictly JSON." }] }],
      tools: [{ googleSearch: {} }]
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
