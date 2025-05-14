// src/fortune.service.ts
import { OpenAI } from 'openai';

export interface Params {
  date: string;
  time: string;
  timezone: string;
}

export default class FortuneService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  /**
   * REST API용: 전체 운세를 한 번에 반환
   */
  static async getFortune(params: Params): Promise<string> {
    const { date, time, timezone } = params;
    const prompt = `생년월일 ${date} ${time} (${timezone}) 기반으로 사주 한 줄 요약을 알려줘.`;
    const resp = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    // 메시지 및 콘텐츠 안전하게 추출
    const message = resp.choices[0]?.message;
    const content = message?.content;
    return content ? content.trim() : '';
  }

  /**
   * SSE 스트리밍용: 청크 단위로 AsyncGenerator 반환
   */
  static async *getFortuneStream(params: Params): AsyncGenerator<string> {
    const { date, time, timezone } = params;
    const prompt = `생년월일 ${date} ${time} (${timezone}) 기반으로 사주를 한 글자씩 스트리밍으로 알려줘.`;
    const resp = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const part of resp) {
      const delta = part.choices[0]?.delta;
      const chunk = delta?.content;
      if (chunk) yield chunk;
    }
  }
}



