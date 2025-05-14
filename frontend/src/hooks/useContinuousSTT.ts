// src/hooks/useContinuousSTT.ts
import { useState, useEffect, useRef } from 'react';
import { sttFromAudio } from '../utils/api';

export default function useContinuousSTT(
  onTranscription: (text: string) => void,
  chunkMs = 1000,
  shouldRecord = false       // 추가된 인자
) {
  const mediaRec = useRef<MediaRecorder>();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    if (!shouldRecord) {
      // 녹음 중단
      mediaRec.current?.stop();
      stream?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      return;
    }

    // shouldRecord가 true일 때 녹음 시작
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRec.current = rec;

      rec.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          try {
            const text = await sttFromAudio(e.data);
            onTranscription(text);
          } catch (err) {
            console.error('연속 STT 에러', err);
          }
        }
      };

      rec.start(chunkMs);
      setIsRecording(true);
    })();

    return () => {
      mediaRec.current?.stop();
      stream?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    };
  }, [onTranscription, chunkMs, shouldRecord]);

  return { isRecording, stop: () => mediaRec.current?.stop() };
}
