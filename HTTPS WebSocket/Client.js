const WebSocket = require('ws');

const serverURL = process.env.WS_SERVER_URL || 'wss://localhost:8443';

const ws = new WebSocket(serverURL);

ws.on('open', () => {
  console.log(`Connected to WebSocket server at ${serverURL}`);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`Received message: ${message.type} - ${message.file} at ${new Date(message.timestamp).toLocaleTimeString()}`);
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server.');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

const cleanUp = () => {
  console.log('Cleaning up...');
  ws.close(() => {
    console.log('WebSocket client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
