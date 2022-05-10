// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');

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

async function start(client) {
  await client
    .sendText('5519999300566@c.us', 'Olá, seu boleto vencerá daqui há 7 dias')
    .then((result) => {
      console.log('Result: ', result); // return object success
    })
    .catch((erro) => {
      console.error('Error when sending: ', erro); // return object error
    });

  await client
    .sendFile(
      '5519999300566@c.us',
      '../downloads/boleto-exemplo.pdf',
      'boleto-exemplo',
      'See my file in pdf'
    )
    .then((result) => {
      console.log('Result: ', result); //return object success
    })
    .catch((erro) => {
      console.error('Error when sending: ', erro); //return object error
    });
}
