// utils/sheetLogger.js

export async function registrarAtendimento({
  canal,
  identificador,
  nome,
  mensagemRecebida,
  respostaEnviada,
  threadId,
  observacoes = ''
}) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const spreadsheetId = process.env.PLANILHA_LUCASBOT_ID;

  if (!apiKey || !spreadsheetId) {
    console.error('❌ Variáveis de ambiente ausentes: GOOGLE_API_KEY ou PLANILHA_LUCASBOT_ID');
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=RAW&key=${apiKey}`;

  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });

  const data = {
    values: [
      [
        timestamp,
        canal,
        identificador,
        nome,
        mensagemRecebida,
        respostaEnviada,
        threadId,
        observacoes
      ]
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ao registrar na planilha: ${errorText}`);
    } else {
      console.log('✅ Atendimento registrado na planilha com sucesso.');
    }
  } catch (err) {
    console.error('❌ Erro inesperado ao registrar na planilha:', err.message);
  }
}
