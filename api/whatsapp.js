import axios from 'axios';
import twilio from 'twilio';
import { getThreadId, setThreadId } from '../utils/threadManager.js';
import { registrarAtendimento } from '../utils/sheetLogger.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const userNumber = req.body.From;
  const ourNumber = req.body.To;
  const userMessage = req.body.Body;

  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  const apiKey = process.env.OPENAI_API_KEY;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  let threadId = getThreadId(userNumber);

  try {
    if (!threadId) {
      const threadResp = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      threadId = threadResp.data.id;
      setThreadId(userNumber, threadId);
    }

    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: 'user', content: userMessage },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    const runResp = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: assistantId },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
            Authorization: `Bearer ${apiKey}`,
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
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    const messages = msgResp.data.data;
    const lastMessage = messages.find((m) => m.role === 'assistant');
    const reply = lastMessage?.content[0]?.text?.value || 'Desculpe, não consegui responder no momento.';

    await client.messages.create({
      from: ourNumber,
      to: userNumber,
      body: reply
    });

    // ✅ Novo registro com API Key
    await registrarAtendimento({
      canal: 'WhatsApp',
      identificador: userNumber,
      nome: '', // Pode ser melhorado depois
      mensagemRecebida: userMessage,
      respostaEnviada: reply,
      threadId,
      observacoes: ''
    });

    res.status(200).end();

  } catch (err) {
    console.error('❌ Erro no processamento:', err.response?.data || err.message);

    try {
      await client.messages.create({
        from: ourNumber,
        to: userNumber,
        body: 'Desculpe, tivemos um erro ao processar sua mensagem. Tente novamente mais tarde.'
      });
    } catch (sendErr) {
      console.error('❌ Falha ao enviar erro via Twilio:', sendErr.message);
    }

    res.status(500).end();
  }
}
