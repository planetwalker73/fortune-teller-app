import express from 'express';
import cors from 'cors';
import ttsRouter from './tts.controller';

const app = express();
// 모든 도메인, 모든 메서드 허용
app.use(cors());
// JSON 바디 파싱
app.use(express.json());
// OPTIONS 프리플라이트 자동 처리
app.options('*', cors());

app.use('/api', ttsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
