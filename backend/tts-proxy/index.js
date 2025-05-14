// backend/tts-proxy/index.js

require('dotenv').config();               // .env 로드
const express = require('express');       // Express 모듈
const cors = require('cors');             // CORS 허용
const { OpenAI } = require('openai');     // OpenAI SDK

// 1) Express 앱 생성
const app = express();

// 2) 미들웨어 설정
app.use(cors());                          // 모든 도메인 허용
app.use(express.json({ limit: '2mb' }));  // JSON 바디 파싱

// 3) OpenAI 클라이언트 초기화
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 4) TTS 엔드포인트 정의
app.post('/api/tts', async (req, res) => {
  console.log('▶︎ TTS 요청 본문:', req.body);
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text 필수' });
    }
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      format: 'mp3',
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('❌ TTS 변환 실패:', err);
    res.status(500).json({ error: 'TTS 변환 실패' });
  }
});

// 5) 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TTS proxy listening on http://localhost:${PORT}/api/tts`);
});
