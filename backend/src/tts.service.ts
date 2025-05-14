import { OpenAI } from 'openai';
import { Readable } from 'stream';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function ttsService(text: string): Promise<NodeJS.ReadableStream> {
  // 모델 필수, mp3 포맷
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
    response_format: 'mp3',
  });

  // ArrayBuffer로 변환 후 Buffer 생성
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return Readable.from(buffer);
}
