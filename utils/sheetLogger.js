// utils/sheetLogger.js

import axios from 'axios';

const apiKey = process.env.GOOGLE_API_KEY;
const sheetId = process.env.PLANILHA_LUCASBOT_ID;
const sheetName = 'Historico';

export async function registrarAtendimento({
  canal,
  identificador,
  nome,
  mensagemRecebida,
  respostaEnviada,
  threadId,
  observacoes = ''
}) {
  const timestamp = new Date().toISOString();

  const linha = [
    timestamp,
    canal,
    identificador,
    nome,
    mensagemRecebida,
    respostaEnviada,
    threadId,
    observacoes
  ];

  const range = `${sheetName}!A1`; // Inserção dinâmica com append
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

  try {
    await axios.post(url, {
      values: [linha]
    });
    console.log('✅ Registro salvo na planilha com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao registrar na planilha:', err.response?.data || err.message);
  }
}
