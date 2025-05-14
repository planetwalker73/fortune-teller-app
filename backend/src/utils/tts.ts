// src/utils/tts.ts
export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const resp = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) {
    // 에러 메시지 보기 좋게
    const err = await resp.json().catch(() => null);
    throw new Error(err?.error || 'TTS 요청 실패');
  }
  // <-- 여기서만 arrayBuffer() 를 쓰면 스트림 핸들링은 끝.
  return await resp.arrayBuffer();
}
