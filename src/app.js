const venom = require('venom-bot');

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

async function start(client) {
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
