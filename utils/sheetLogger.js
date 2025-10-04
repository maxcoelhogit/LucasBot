// 📁 utils/sheetLogger.js
import { google } from 'googleapis';

// Autenticação com JWT usando variáveis de ambiente
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

export async function registrarNaPlanilha({
  spreadsheetId,
  dados
}) {
  try {
    const valores = [[
      new Date().toISOString(), // Timestamp
      dados.canal || '',
      dados.identificador || '',
      dados.nome || '',
      dados.mensagem || '',
      dados.resposta || '',
      dados.thread || '',
      dados.observacoes || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Historico!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: valores }
    });
  } catch (error) {
    console.error('Erro ao registrar na planilha:', error);
    throw error;
  }
}
