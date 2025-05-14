// backend/src/tts.controller.ts
import { Router } from 'express'
import { ttsService } from './tts.service'

const router = Router()

// 요청 바디 { text: string }
router.post('/', async (req, res, next) => {
  try {
    const { text } = req.body
    // OpenAI TTS 스트림 생성
   const stream = await ttsService(text);

    res.setHeader('Content-Type', 'audio/mpeg')
    // 스트리밍으로 바로 내려주기
    stream.pipe(res)
  } catch (err) {
    next(err)
  }
})

export default router


