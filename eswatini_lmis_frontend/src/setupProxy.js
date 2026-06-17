// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/uploads'],
    createProxyMiddleware({
      target: 'https://elmiseswatini-backend.onrender.com',
      changeOrigin: true,
    })
  );
};