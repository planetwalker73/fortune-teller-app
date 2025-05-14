// backend/api/index.js

const express = require('express');
const cors = require('cors');

// dist로 컴파일된 모듈을 불러옵니다
const { ttsService } = require('../dist/tts.service');
const { ttsRouter } = require('../dist/tts.controller');

const app = express();
app.use(cors());             // 전체 도메인 허용: 개발 시 localhost:3000 등
app.use(express.json());

// 헬스체크
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// TTS 라우터 (/tts 경로는 controller에서 정의되어 있습니다)
app.use('/', ttsRouter);

module.exports = app;
