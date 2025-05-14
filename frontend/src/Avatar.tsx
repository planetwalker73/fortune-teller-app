// src/Avatar.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Mesh } from 'three';

type AvatarProps = { audioLevel: number };

export default function Avatar({ audioLevel }: AvatarProps) {
  const { scene } = useGLTF('/models/avatar.glb') as any;
  // 크기/위치 조정
  scene.scale.set(6, 6, 6);
  scene.position.set(0, 0, 0);

  // 입 메시 참조
  const mouthRef = useRef<Mesh>();

  // 씬 순회하여 이름에 'mouth' 포함된 메쉬 찾기
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && /mouth/i.test(child.name)) {
        mouthRef.current = child;
      }
    });
  }, [scene]);

  // 매 프레임 립싱크 (y축 이동)
  useFrame(() => {
    const mouth = mouthRef.current;
    if (!mouth) return;
    // audioLevel에 비례해 입 위치를 조금 내림
    mouth.position.y = -audioLevel * 0.02;
  });

  return <primitive object={scene} dispose={null} />;
}
