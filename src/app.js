/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const venom = require('venom-bot');
const api = require('./services/api');
const { currentDatePlus } = require('./utils/dates');
const downloadFile = require('./utils/downloadFile');
const deleteFile = require('./utils/deleteFile');
require('dotenv').config();

const hoursToWait = 24; // 24 hours

// Set axios interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // if access token is invalid (code 401), generate new token
    if (error.response.data.errCode === 401) {
      const accessToken = await getAccessToken();
      // Set api default Auth Header with new token
      setApiAuthHeader(accessToken);

      // Set originalRequest Authorization header with new token and retry request
      const originalRequest = error.config;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api.request(originalRequest);
    }

    console.error(error.response.data);
    // return Promise.reject(error);
  }
);

// Create venom instance
venom
  .create(
    'boleto-zap',
    (base64Qrimg, asciiQR, attempts) => {},
    (statusSession, session) => {},
    { useChrome: false, browserArgs: ['--no-sandbox'] }
  )
  .then((venomClient) => start(venomClient))
  .catch((erro) => {
    console.log(erro);
  });

async function start(venomClient) {
  // Get accessToken and set Authorization header with access_token
  console.log('Set Authorization header with access_token');
  const accessToken = await getAccessToken();
  setApiAuthHeader(accessToken);

  // Get boletos em aberto que vencerão amanhã e enviar para cliente
  console.log('Buscar boletos que vencerão amanhã e enviar para cliente');
  const boletosQueVenceraoAmanha = await getBoletosQueVenceraoDaqui(1);
  await enviarBoletosParaClientes(boletosQueVenceraoAmanha, venomClient);

  // Get boletos em aberto que vencerão nos próximos 7 dias e enviar para cliente
  console.log('Buscar boletos que vencerão daqui 7 dias e enviar para cliente');
  const boletosQueVenceraoDaqui7Dias = await getBoletosQueVenceraoDaqui(7);
  await enviarBoletosParaClientes(boletosQueVenceraoDaqui7Dias, venomClient);

  await enviarMsgParaDesenvolvedor(
    'As operações de hoje foram concluídas.',
    venomClient
  );

  // Imprimir log dizendo que as operações do dia foram concluídas
  console.log('As operações de hoje foram concluídas.');

  // Repeat the function start every 24 hours
  setTimeout(async () => {
    await start(venomClient);
  }, hoursToWait * 3600 * 1000);
}

async function getAccessToken() {
  const data = {
    grant_type: 'personal',
    personal_token: `${process.env.PERSONAL_TOKEN}`,
  };

  const response = await api({
    method: 'post',
    baseUrl: undefined,
    url: 'https://v4.egestor.com.br/api/oauth/access_token',
    data,
  });

  const accessToken = response.data.access_token;

  return accessToken;
}

function setApiAuthHeader(accessToken) {
  api.defaults.headers.Authorization = `Bearer ${accessToken}`;
}

async function getBoletosQueVenceraoDaqui(dias) {
  const dataVencimento = currentDatePlus(dias);

  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&orderBy=dtVenc,desc`
  );

  const boletos = response.data;

  return { ...boletos, diasParaVencer: dias };
}

async function enviarMsgParaDesenvolvedor(message, venomClient) {
  await venomClient
    .sendText(`55${process.env.TELEFONE_DESENVOLVEDOR}@c.us`, `${message}`)
    .then((result) => {})
    .catch((err) => {
      console.error('Error when sending: ', err); // return object error
    });
}

async function enviarBoletosParaClientes(dadosDosBoletos, venomClient) {
  const { diasParaVencer } = dadosDosBoletos.data;

  let mensagemDataVenc;
  if (diasParaVencer === 1) {
    mensagemDataVenc = 'amanhã';
  } else {
    mensagemDataVenc = `daqui a ${diasParaVencer}`;
  }

  for (const element of dadosDosBoletos) {
    const response = await api.get(`/boletos/${element.codigo}`);

    const linkBoleto = response.data.link;
    const codCliente = response.data.codContato;

    const { data } = await api.get(`/contatos/${codCliente}`);

    const dadosCliente = data;
    const telefoneCliente = dadosCliente.fones[1];
    const nomeCliente = dadosCliente.nome;

    await downloadFile(linkBoleto);

    // Enviar mensagem
    await venomClient
      .sendText(
        `55${telefoneCliente}@c.us`,
        `Olá, ${nomeCliente}. Seu boleto vencerá ${mensagemDataVenc}.`
      )
      .then((result) => {})
      .catch(async (erro) => {
        console.error('Error when sending text message: ', erro); // return object error
        await enviarMsgParaDesenvolvedor(erro, venomClient);
      });

    // Enviar boleto
    await venomClient
      .sendFile(
        `55${telefoneCliente}@c.us`,
        './temp/boleto-cliente.pdf',
        'boleto-cliente',
        'Veja meu arquivo pdf'
      )
      .then((result) => {})
      .catch(async (erro) => {
        console.error('Error when sending file: ', erro); // return object error
        await enviarMsgParaDesenvolvedor(erro, venomClient);
      });

    await deleteFile('./temp/boleto-cliente.pdf');
  }
}
