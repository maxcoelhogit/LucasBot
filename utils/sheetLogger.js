// utils/sheetLogger.js
import axios from 'axios';

export async function registrarAtendimento({ canal, identificador, nome, mensagemRecebida, respostaEnviada, threadId, observacoes }) {
  const sheetId = process.env.PLANILHA_LUCASBOT_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  const data = [
    new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    canal,
    identificador,
    nome,
    mensagemRecebida,
    respostaEnviada,
    threadId,
    observacoes
  ];

  const range = 'A2:H2'; // Adiciona nova linha na aba padrão (Sheet1)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

  try {
    await axios.post(url, {
      values: [data]
    });
    console.log('✅ Atendimento registrado com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao registrar na planilha:', error.response?.data || error.message);
    throw error;
  }
}
