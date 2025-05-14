// backend/api/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { Readable } = require('stream');

// OpenAI 클라이언트 세팅
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** 
 * text → mp3 스트림 변환 함수 
 */
async function ttsService(text) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
    response_format: 'mp3',
  });
  // OpenAI ResponseBody는 Web ReadableStream, Buffer 변환 뒤 Node 스트림으로
  const arrayBuffer = await response.arrayBuffer();
  return Readable.from(Buffer.from(arrayBuffer));
}

const app = express();
app.use(cors({ origin: '*' }));  // 모든 오리진 허용
app.use(express.json());

// 헬스체크
app.get('/api/health', (_req, res) => {
  res.status(200).send('OK');
});

// TTS 엔드포인트
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const stream = await ttsService(text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    stream.pipe(res);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS 생성 실패' });
  }
});

module.exports = app;
