import { Router } from 'express';
import { ttsService } from './tts.service';

// TTS 관련 라우터 생성
export const ttsRouter = Router();

// 헬스체크 엔드포인트
ttsRouter.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// POST /api/tts: 텍스트를 받아 음성 스트림 반환
ttsRouter.post('/tts', async (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const audioStream = await ttsService(text);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    audioStream.pipe(res);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS 생성 실패' });
  }
});
