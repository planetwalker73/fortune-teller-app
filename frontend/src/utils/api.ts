const WHISPER_BASE = 'http://your-whisper-server.com:5000';

export async function sttFromAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append('audio', blob, 'input.webm');
  const resp = await fetch(`${WHISPER_BASE}/api/stt`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) {
    console.error('Whisper STT 에러', resp.status, await resp.text());
    throw new Error('STT 요청 실패');
  }
  const { text } = await resp.json();
  return text;
}
