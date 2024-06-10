const fs = require('fs');
const zmq = require('zeromq');
const path = require('path');

const filename = process.env.WATCH_FILE || 'default.txt';
const port = process.env.ZMQ_PORT || '60400';

const publisher = new zmq.Publisher();

const initPublisher = async () => {
  try {
    await publisher.bind(`tcp://*:${port}`);
    console.log(`Listening for zmq subscribers on port ${port}...`);
  } catch (err) {
    console.error(`Failed to bind publisher to port ${port}:`, err);
    process.exit(1);
  }
};

fs.watch(filename, (eventType, changedFilename) => {
  if (eventType === 'change') {
    const message = JSON.stringify({
      type: 'changed',
      file: changedFilename || filename,
      timestamp: Date.now(),
    });

    publisher.send(message)
      .then(() => {
        console.log(`Sent message: ${message}`);
      })
      .catch(err => {
        console.error('Failed to send message:', err);
      });
  }
});

initPublisher();

const cleanUp = () => {
  console.log('Cleaning up...');
  publisher.close()
    .then(() => {
      console.log('Publisher socket closed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error closing publisher socket:', err);
      process.exit(1);
    });
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
