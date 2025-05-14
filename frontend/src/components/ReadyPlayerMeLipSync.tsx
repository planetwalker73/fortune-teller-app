// src/components/ReadyPlayerMeLipSync.tsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface LipSyncProps { audioLevel: number; }

function ReadyPlayerAvatar({ audioLevel }: LipSyncProps) {
  // env 변수가 비어 있을 땐 로컬 파일로 fallback
  const url =
    process.env.REACT_APP_MODEL_URL ||
    `${process.env.PUBLIC_URL}/models/avatar.glb`;

  const { scene } = useGLTF(url);
  const mesh: any = scene.children.find((c: any) => c.morphTargetInfluences);
  const influences: number[] = mesh.morphTargetInfluences;
  const dict: Record<string, number> = mesh.morphTargetDictionary;
  const JAW = 'jawOpen';

  useFrame(() => {
    influences.forEach((_, i) => (influences[i] = 0));
    const idx = dict[JAW];
    if (idx != null) influences[idx] = Math.min(Math.max(audioLevel * 5, 0), 1);
  });

  return <primitive object={scene} dispose={null} />;
}

export default function ReadyPlayerMeLipSync({ audioLevel }: LipSyncProps) {
  return (
    <Canvas camera={{ position: [0, 1.6, 2], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <ReadyPlayerAvatar audioLevel={audioLevel} />
    </Canvas>
  );
}
