const venom = require('venom-bot');
const api = require('./services/api');
const { currentDate, currentDatePlus7Days } = require('../utils/dates');
require('dotenv').config();

const secondsToWait = 10; // 20 seconds
const targetPhoneNumber = '19995827540';

venom
  .create(
    'session-name',
    (base64Qrimg, asciiQR, attempts) => {},
    (statusSession, session) => {},
    { useChrome: false, browserArgs: ['--no-sandbox'] }
  )
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getAccessToken() {
  const data = {
    grant_type: 'personal',
    personal_token: `${process.env.PERSONAL_TOKEN}`,
  };

  try {
    const response = await api.post('/oauth/access_token', data);
    const accessToken = response.data.access_token;

    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

async function start(client) {
  // Set Authorization header
  const accessToken = getAccessToken();

  api.defaults.headers.Authorization = `Bearer ${accessToken}`;

  // Get boletos em aberto que vencerão nos próximos 7 dias
  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${currentDate}&dtFim=${currentDatePlus7Days}&orderBy=dtVenc,desc`
  );

  const boletosEmAberto = response.data;

  await client
    .sendText(
      `55${targetPhoneNumber}@c.us`,
      'Olá, seu boleto exemplo vencerá daqui há 7 dias'
    )
    .then((result) => {
      console.log('Result: ', result); // return object success
    })
    .catch((erro) => {
      console.error('Error when sending: ', erro); // return object error
    });

  await sleep(20 * 1000);

  await client
    .sendFile(
      `55${targetPhoneNumber}@c.us`,
      './downloads/boleto-exemplo.pdf',
      'boleto-exemplo',
      'Veja meu arquivo pdf'
    )
    .then((result) => {
      console.log('Result: ', result); // return object success
    })
    .catch((erro) => {
      console.error('Error when sending: ', erro); // return object error
    });

  setTimeout(async () => {
    await start(client);
  }, secondsToWait * 1000);
}
