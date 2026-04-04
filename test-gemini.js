const apiKey = 'AIzaSyAFuC7ktID9DlWL36s3yEuT4smnvbR9p6Y';
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "What are the flights from Beijing to Shanghai on 2026-03-24? Give me 3 options." }] }]
  })
}).then(res => res.json()).then(console.log).catch(console.error);
