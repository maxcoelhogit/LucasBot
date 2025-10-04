import axios from 'axios';

const spreadsheetId = process.env.PLANILHA_LUCASBOT_ID;
const apiKey = process.env.GOOGLE_API_KEY;

export async function registrarAtendimento({ canal, identificador, nome, mensagemRecebida, respostaEnviada, threadId, observacoes }) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=RAW&key=${apiKey}`;

    const data = {
      values: [[
        new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        canal,
        identificador,
        nome || '',
        mensagemRecebida,
        respostaEnviada,
        threadId,
        observacoes || ''
      ]]
    };

    await axios.post(url, data);
    console.log('✅ Atendimento registrado na planilha!');
  } catch (err) {
    console.error('❌ Erro ao registrar na planilha:', err.response?.data || err.message);
  }
}
