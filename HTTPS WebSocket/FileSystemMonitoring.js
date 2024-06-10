const fs = require('fs');
const WebSocket = require('ws');
const https = require('https');
const path = require('path');
const { readFileSync } = require('fs');

const filename = process.env.WATCH_FILE || 'default.txt';
const port = process.env.WS_PORT || 8443;
const sslKeyPath = process.env.SSL_KEY_PATH || 'path/to/your/ssl/key.pem';
const sslCertPath = process.env.SSL_CERT_PATH || 'path/to/your/ssl/cert.pem';

const serverOptions = {
  key: readFileSync(sslKeyPath),
  cert: readFileSync(sslCertPath)
};

const server = https.createServer(serverOptions);
const wss = new WebSocket.Server({ server });

const broadcast = (message) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

fs.watch(filename, (eventType, changedFilename) => {
  if (eventType === 'change') {
    const message = JSON.stringify({
      type: 'changed',
      file: changedFilename || filename,
      timestamp: Date.now(),
    });

    broadcast(message);
    console.log(`Sent message: ${message}`);
  }
});

server.listen(port, () => {
  console.log(`Listening for WebSocket subscribers on port ${port}...`);
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
