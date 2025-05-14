"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioAnalyser = createAudioAnalyser;
exports.getAudioLevel = getAudioLevel;
// src/utils/audioSync.ts
function createAudioAnalyser(audio) {
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256; // 분석 해상도
    src.connect(analyser);
    analyser.connect(ctx.destination); // 소리도 들리게
    return { analyser, ctx };
}
function getAudioLevel(analyser) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // 0~1 사이의 평균볼륨 계산
    const avg = data.reduce((sum, v) => sum + v, 0) / data.length / 255;
    return avg;
}
