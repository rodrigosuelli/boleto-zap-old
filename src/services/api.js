const axios = require('axios');

const url = 'https://v4.egestor.com.br/api/v1';

const api = axios.create({
  baseURL: url,
});

module.exports = api;
