const venom = require('venom-bot');
const api = require('./services/api');
const { currentDate, currentDatePlus } = require('../utils/dates');
const downloadFile = require('../utils/downloadFile');
const deleteFile = require('../utils/deleteFile');
require('dotenv').config();

const hoursToWait = 24; // 24 hours

venom
  .create(
    'session-name',
    (base64Qrimg, asciiQR, attempts) => {},
    (statusSession, session) => {},
    { useChrome: false, browserArgs: ['--no-sandbox'] }
  )
  .then((venomClient) => start(venomClient))
  .catch((erro) => {
    console.log(erro);
  });

async function start(venomClient) {
  // Set Authorization header with access_token
  console.log('Setar Authorization header with access_token');
  const accessToken = getAccessToken();
  api.defaults.headers.Authorization = `Bearer ${accessToken}`;

  // Change baseUrl
  api.defaults.baseURL = 'https://v4.egestor.com.br/api/v1';

  // Get boletos em aberto que vencerão amanhã e enviar para cliente
  console.log('Buscar boletos que vencerão amanha');
  const boletosQueVenceraoAmanha = await getBoletosQueVenceraoDaqui(1);
  console.log('Enviar boletos que vencerão amanha para clientes');
  enviarBoletosParaClientes(boletosQueVenceraoAmanha);

  // Get boletos em aberto que vencerão nos próximos 7 dias e enviar para cliente
  console.log('Buscar boletos que vencerão daqui 7 dias');
  const boletosQueVenceraoDaqui7Dias = await getBoletosQueVenceraoDaqui(7);
  console.log('Enviar boletos que vencerão daqui 7 dias para clientes');
  enviarBoletosParaClientes(boletosQueVenceraoDaqui7Dias);

  console.log(
    `Log ${currentDate} (yyyy-mm-dd) - As operações de hoje foram concluídas.`
  );

  setTimeout(async () => {
    await start(venomClient);
  }, hoursToWait * 3600 * 1000);
}

async function getAccessToken() {
  const data = {
    grant_type: 'personal',
    personal_token: `${process.env.PERSONAL_TOKEN}`,
  };

  const response = await api.post('/oauth/access_token', data);
  const accessToken = response.data.access_token;

  return accessToken;
}

async function getBoletosQueVenceraoDaqui(dias) {
  const dataVencimento = currentDatePlus(dias);

  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&orderBy=dtVenc,desc`
  );

  const boletos = response.data;

  return { ...boletos, diasParaVencer: dias };
}

async function enviarMsgDeErroParaDesenvolvedor(msgErro, venomClient) {
  await venomClient
    .sendText(`55${process.env.TELEFONE_DESENVOLVEDOR}@c.us`, `${msgErro}`)
    .then((result) => {})
    .catch((err) => {
      console.error('Error when sending: ', err); // return object error
    });
}

async function enviarBoletosParaClientes(dadosDosBoletos, venomClient) {
  const { diasParaVencer } = dadosDosBoletos.data;

  dadosDosBoletos.data.forEach(async (element) => {
    const response = await api.get(`/boletos/${element.codigo}`);

    const linkBoleto = response.data.link;
    const codCliente = response.data.codContato;

    const { data } = await api.get(`/contatos/${codCliente}`);

    const dadosCliente = data;
    const telefoneCliente = dadosCliente.fones[1];
    const nomeCliente = dadosCliente.nome;

    downloadFile(linkBoleto);

    // Enviar mensagem
    await venomClient
      .sendText(
        `55${telefoneCliente}@c.us`,
        `Olá, ${nomeCliente}. Seu boleto exemplo vencerá em ${
          diasParaVencer === 1 ? 'amanhã' : diasParaVencer
        }`
      )
      .then((result) => {})
      .catch(async (erro) => {
        console.error('Error when sending: ', erro); // return object error
        // Enviar mensagem de erro no Whatsapp do Desenvolvedor
        await enviarMsgDeErroParaDesenvolvedor(erro, venomClient);
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
        console.error('Error when sending: ', erro); // return object error
        // Enviar mensagem de erro no Whatsapp do Desenvolvedor
        await enviarMsgDeErroParaDesenvolvedor(erro, venomClient);
      });

    await deleteFile('./temp/boleto-cliente.pdf');
  });
}
