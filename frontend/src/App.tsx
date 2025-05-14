// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar from './Avatar';
import { ttsFromText } from './utils/api';
import { createAudioAnalyser, getAudioLevel } from './utils/audioSync';
import useContinuousSTT from './hooks/useContinuousSTT';

type Step = 'INIT' | 'ASK_NAME' | 'ASK_BIRTH' | 'ASK_FORTUNE' | 'ASK_MORE';

export default function App() {
  const [step, setStep] = useState<Step>('INIT');
  const [audioLevel, setAudioLevel] = useState(0);
  const [userName, setUserName] = useState('');
  const [birthInfo, setBirthInfo] = useState('');
  const [chatText, setChatText] = useState('');
  const [partialText, setPartialText] = useState(''); // 연속 STT 결과
  const wsRef = useRef<WebSocket>();
  const audioRef = useRef<HTMLAudioElement>();

  // 자동 연속 STT 훅: ASK_NAME/ASK_BIRTH 단계에서만 녹음
  const { isRecording, stop } = useContinuousSTT(
    (newText) => setPartialText(t => (t + ' ' + newText).trim()),
    1000,
    step === 'ASK_NAME' || step === 'ASK_BIRTH'
  );

  // WebSocket 연결 및 메시지 핸들러
  useEffect(() => {
    if (!userName || !birthInfo) return;
    const socket = new WebSocket(
      `ws://localhost:4000/ws/chat?` +
      `name=${encodeURIComponent(userName)}` +
      `&birthDate=${birthInfo.split(' ')[0]}` +
      `&birthTime=${birthInfo.split(' ')[1] || ''}`
    );
    socket.onmessage = async (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.event === 'token') {
        setChatText(t => t + msg.token);
      }
      if (msg.event === 'done') {
        await speak(chatText + msg.full.slice(chatText.length));
        setChatText('');
        setStep('ASK_MORE');
      }
    };
    wsRef.current = socket;
    return () => socket.close();
  }, [userName, birthInfo]);

  // TTS 재생 & 립싱크 트리거
  const speak = async (text: string) => {
    const buf = await ttsFromText(text);
    const audio = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' })));
    audioRef.current = audio;
    const { analyser, ctx } = createAudioAnalyser(audio);
    await ctx.resume();
    audio.play();
    const tick = () => {
      if (audio.paused) {
        setAudioLevel(0);
      } else {
        setAudioLevel(getAudioLevel(analyser));
        requestAnimationFrame(tick);
      }
    };
    tick();
  };

  // 단계별 시퀀스 처리
  const handleSequence = async () => {
    if (step === 'INIT') {
      await speak('안녕하세요, 저는 닥터 존입니다.');
      await speak('당신의 이름은 무엇입니까?');
      setStep('ASK_NAME');
    }
    else if (step === 'ASK_NAME') {
      // 자동 녹음 종료 후 partialText 사용
      stop();
      const name = partialText.trim();
      setUserName(name);
      await speak(`반갑습니다, ${name}님!`);
      await speak('생년월일과 시간을 알려주시면 사주를 풀이해 드리겠습니다.');
      setStep('ASK_BIRTH');
    }
    else if (step === 'ASK_BIRTH') {
      stop();
      const birth = partialText.trim();
      setBirthInfo(birth);
      await speak('회원님의 사주를 알려드리겠습니다. 잠시만 기다려 주세요.');
      setStep('ASK_FORTUNE');
      wsRef.current?.send(JSON.stringify({ text: 'START_FORTUNE' }));
    }
    else if (step === 'ASK_MORE') {
      // 추가 질문 단계: 마찬가지로 연속 STT → send to WS
      stop();
      const question = partialText.trim();
      setPartialText('');
      setChatText('');
      setStep('ASK_FORTUNE');
      wsRef.current?.send(JSON.stringify({ text: question }));
    }
  };

  // partialText 초기화: ASK_NAME/ASK_BIRTH 단계 진입 시
  useEffect(() => {
    if (step === 'ASK_NAME' || step === 'ASK_BIRTH' || step === 'ASK_MORE') {
      setPartialText('');
    }
  }, [step]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 단계별 버튼 */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button onClick={handleSequence}>
          {{
            INIT: '서비스 시작',
            ASK_NAME: isRecording ? '말하는 중...' : '이름 말하기',
            ASK_BIRTH: isRecording ? '말하는 중...' : '생년월일 말하기',
            ASK_FORTUNE: '사주 풀이 듣기',
            ASK_MORE: isRecording ? '말하는 중...' : '추가 질문하기'
          }[step]}
        </button>
      </div>

      {/* STT로 인식 중인 텍스트 */}
      {(step === 'ASK_NAME' || step === 'ASK_BIRTH' || step === 'ASK_MORE') && (
        <div style={{
          position: 'absolute', top: 70, left: 20,
          background: 'rgba(255,255,255,0.8)', padding: '0.5rem'
        }}>
          {partialText || '…말하는 내용을 기다리는 중…'}
        </div>
      )}

      {/* GPT 스트리밍 텍스트 표시 */}
      {step === 'ASK_FORTUNE' && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20,
          background: 'rgba(255,255,255,0.8)', padding: '0.5rem'
        }}>
          {chatText}
        </div>
      )}

      {/* 3D 캔버스 */}
      <Canvas camera={{ position: [0, 1.6, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} />
        <Avatar audioLevel={audioLevel} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
