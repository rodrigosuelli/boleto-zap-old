const util = require('util');
const stream = require('stream');
const fs = require('fs');

const api = require('../src/services/api');

const pipeline = util.promisify(stream.pipeline);

async function downloadFile(fileLink) {
  const response = await api.get(`${fileLink}`, {
    responseType: 'stream',
  });

  try {
    await pipeline(
      response.data,
      fs.createWriteStream('/temp/boleto-cliente.pdf')
    );

    console.log('download pdf pipeline successful');
  } catch (error) {
    console.error('error downloading file:', error.message);
  }
}

module.exports = downloadFile;
