const axios = require('axios');

const url = 'https://v4.egestor.com.br/api';

const api = axios.create({
  baseURL: url,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error.data.errMsg);
    // return Promise.reject(error);
  }
);

module.exports = api;
