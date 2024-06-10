const zmq = require('zeromq');

// Configuration
const port = process.env.ZMQ_PORT || '60400';
const subscriber = new zmq.Subscriber();

const initSubscriber = async () => {
  try {
    await subscriber.connect(`tcp://localhost:${port}`);
    console.log(`Connected to zmq publisher on port ${port}...`);

    // Subscribe to all messages
    subscriber.subscribe('');

    for await (const [msg] of subscriber) {
      const message = msg.toString();
      console.log(`Received message: ${message}`);
    }
  } catch (err) {
    console.error(`Failed to connect to zmq publisher on port ${port}:`, err);
    process.exit(1);
  }
};

initSubscriber();

const cleanUp = () => {
  console.log('Cleaning up...');
  subscriber.close()
    .then(() => {
      console.log('Subscriber socket closed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error closing subscriber socket:', err);
      process.exit(1);
    });
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
