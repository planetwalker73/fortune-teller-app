// backend/api/stt.js
const openai = require('./openai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  // multipart/form-data 처리가 필요하므로, Vercel의 경우 raw body를 FormData로 변환하기 어렵습니다.
  // 간단히 WAV/OGG URL로 전달받는 방식으로 예시:
  const { audioUrl } = req.body;
  if (!audioUrl) return res.status(400).json({ error: 'audioUrl is required' });

  try {
    // remote URL을 직접 OpenAI에 넘길 수 있습니다.
    const transcription = await openai.audio.transcriptions.create({
      file: audioUrl,
      model: 'whisper-1',
      response_format: 'text',
    });
    res.json({ text: transcription });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'STT failed' });
  }
};
