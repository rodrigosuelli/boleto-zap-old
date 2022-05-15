const axios = require('axios');

const url = 'https://v4.egestor.com.br/api/v1';

const api = axios.create({
  baseURL: url,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    // return Promise.reject(error);
  }
);

module.exports = api;
