import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ttsRouter } from './tts.controller';

const app = express();

// 1) CORS를 가장 먼저
app.use(cors({
  origin: 'http://localhost:3000',  // 개발 중엔 프론트 주소
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// 2) JSON 바디 파싱
app.use(express.json());

// 3) 헬스체크
app.get('/api/health', (_req, res) => res.send('OK'));

// 4) TTS 라우터
app.use('/api', ttsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
