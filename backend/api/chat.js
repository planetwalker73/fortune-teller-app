// backend/api/chat.js
const openai = require('./openai');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  const { name, birthDate, birthTime, question } = req.query;
  if (!name || !birthDate) return res.status(400).send('Missing params');

  const systemPrompt =
    `당신은 Master John, 사주 전문 점쟁이입니다.\n` +
    `안녕하세요 ${name}님, Master John입니다.\n` +
    `생년월일 ${birthDate} ${birthTime || ''} 기반 사주풀이를 시작합니다.`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(question ? [{ role: 'user', content: question }] : [])
  ];

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages
  });

  let buffer = '';
  for await (const part of stream) {
    const token = part.choices[0].delta.content;
    if (token) {
      buffer += token;
      res.write(`event: token\ndata: ${JSON.stringify(token)}\n\n`);
    }
  }
  res.write(`event: done\ndata: ${JSON.stringify(buffer)}\n\n`);
  res.end();
};
