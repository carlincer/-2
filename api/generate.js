// api/generate.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { lat, lng } = req.body || {};

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured' });
  }

  const prompt = `
[역할] 너는 실시간 교통 신호 분석 및 예측 AI 시스템이야.
[위치] 위도: ${lat}, 경도: ${lng}

위 GPS 좌표 근처의 전방 교차로 신호등 잔여 시간을 추론하고 사용자가 안전하게 주행할 수 있도록 유용한 안내를 제공해줘.

다음 항목을 포함해서 친절하고 가독성 좋게 요약해줘:
1. 가장 가까운 전방 교차로명
2. 현재 신호 상태 (예: 녹색불/빨간불)
3. 잔여시간 추정치 (초 단위)
4. 권장 주행 조언 (예: "서행하세요", "다음 신호를 대기하세요" 등)
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to generate response from Gemini API',
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '결과를 생성할 수 없습니다.';

    return res.status(200).json({ result: aiText });
  } catch (error) {
    console.error('Server Handler Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
