import axios from 'axios';
import { getThreadId, setThreadId } from '../utils/threadManager.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  const { Body, From } = req.body; // WhatsApp body + phone

  const userId = From;
  let threadId = getThreadId(userId);

  try {
    if (!threadId) {
      const threadResp = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      threadId = threadResp.data.id;
      setThreadId(userId, threadId);
    }

    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: 'user', content: Body },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    const runResp = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: process.env.OPENAI_ASSISTANT_ID },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    let completed = false;
    let runData;
    while (!completed) {
      await new Promise((r) => setTimeout(r, 1000));
      runData = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runResp.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      if (runData.data.status === 'completed') completed = true;
    }

    const msgResp = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    const messages = msgResp.data.data;
    const lastMessage = messages.find((m) => m.role === 'assistant');

    res.status(200).json({
      reply: lastMessage?.content[0]?.text?.value || 'Desculpe, não consegui responder.'
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao processar a mensagem.' });
  }
}
