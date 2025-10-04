import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function registrarAtendimento({
  canal,
  identificador,
  nome,
  mensagemRecebida,
  respostaEnviada,
  threadId,
  observacoes
}) {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      SCOPES
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.PLANILHA_LUCASBOT_ID;
    const range = 'Historico!A:H';

    const values = [[
      new Date().toISOString(),
      canal,
      identificador,
      nome,
      mensagemRecebida,
      respostaEnviada,
      threadId,
      observacoes
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    console.log('✅ Atendimento registrado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao registrar na planilha:', error);
    throw error;
  }
}
