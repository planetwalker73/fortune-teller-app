// backend/api/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { Readable } = require('stream');

const app = express();

// 1) CORS 미들웨어 설정 (모든 도메인 허용)
//    Preflight(OPTIONS)도 자동 처리되도록 app.options() 추가
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-frontend.vercel.app'] }));
app.options('*', cors());

// 2) JSON 바디 파싱
app.use(express.json());

// OpenAI 클라이언트
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 헬스체크
app.get('/api/health', (_req, res) => {
  res.status(200).send('OK');
});

// TTS 엔드포인트
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      response_format: 'mp3',
    });
    const arrayBuffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(arrayBuffer));

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    stream.pipe(res);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS 생성 실패' });
  }
});

module.exports = app;
