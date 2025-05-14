// src/utils/api.ts
const API_BASE = ' https://fortune-teller-backend-nnffj5s7s-johns-projects-2c268d8f.vercel.app';

export async function sttFromAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append('audio', blob, 'input.webm');
  const resp = await fetch(`${API_BASE}/api/stt`, {
    method: 'POST',
    mode: 'cors',
    body: form,
  });
  if (!resp.ok) throw new Error('STT 요청 실패');
  const { text } = await resp.json();
  return text;
}

export async function ttsFromText(text: string): Promise<ArrayBuffer> {
  const resp = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error('TTS 요청 실패');
  return resp.arrayBuffer();
}
