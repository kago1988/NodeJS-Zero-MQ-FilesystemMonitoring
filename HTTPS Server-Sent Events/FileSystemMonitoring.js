const fs = require('fs');
const express = require('express');
const https = require('https');
const path = require('path');
const { readFileSync } = require('fs');

const filename = process.env.WATCH_FILE || 'default.txt';
const port = process.env.SSE_PORT || 8443;
const sslKeyPath = process.env.SSL_KEY_PATH || 'path/to/your/ssl/key.pem';
const sslCertPath = process.env.SSL_CERT_PATH || 'path/to/your/ssl/cert.pem';

const serverOptions = {
  key: readFileSync(sslKeyPath),
  cert: readFileSync(sslCertPath)
};

const app = express();
const server = https.createServer(serverOptions, app);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  const watcher = fs.watch(filename, (eventType, changedFilename) => {
    if (eventType === 'change') {
      const message = {
        type: 'changed',
        file: changedFilename || filename,
        timestamp: Date.now(),
      };
      sendEvent(message);
      console.log(`Sent message: ${JSON.stringify(message)}`);
    }
  });

  req.on('close', () => {
    watcher.close();
    res.end();
  });
});

server.listen(port, () => {
  console.log(`SSE server is listening on port ${port}...`);
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
