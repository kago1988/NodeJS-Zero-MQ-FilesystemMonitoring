const fs = require('fs');
const https = require('https');
const axios = require('axios');
const path = require('path');
const { readFileSync } = require('fs');

const filename = process.env.WATCH_FILE || 'default.txt';
const port = process.env.WEBHOOK_SERVER_PORT || 8443;
const sslKeyPath = process.env.SSL_KEY_PATH || 'path/to/your/ssl/key.pem';
const sslCertPath = process.env.SSL_CERT_PATH || 'path/to/your/ssl/cert.pem';
const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/webhook';

const serverOptions = {
  key: readFileSync(sslKeyPath),
  cert: readFileSync(sslCertPath)
};

const server = https.createServer(serverOptions);

fs.watch(filename, (eventType, changedFilename) => {
  if (eventType === 'change') {
    const message = {
      type: 'changed',
      file: changedFilename || filename,
      timestamp: Date.now(),
    };

    axios.post(webhookUrl, message)
      .then(() => {
        console.log(`Sent webhook: ${JSON.stringify(message)}`);
      })
      .catch(err => {
        console.error('Failed to send webhook:', err);
      });
  }
});

server.listen(port, () => {
  console.log(`Webhook server is listening on port ${port}...`);
});

const cleanUp = () => {
  console.log('Cleaning up...');
  server.close(() => {
    console.log('HTTPS server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
