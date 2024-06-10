const mqtt = require('mqtt');

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const topic = process.env.MQTT_TOPIC || 'file/changes';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${brokerUrl}`);
  
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Failed to subscribe to topic:', err);
    } else {
      console.log(`Subscribed to topic ${topic}`);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Received message from topic ${topic}: ${message.toString()}`);
});

const cleanUp = () => {
  console.log('Cleaning up...');
  client.end(() => {
    console.log('MQTT client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
