const fs = require('fs');
const mqtt = require('mqtt');
const path = require('path');

const filename = process.env.WATCH_FILE || 'default.txt';
const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const topic = process.env.MQTT_TOPIC || 'file/changes';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${brokerUrl}`);
});

fs.watch(filename, (eventType, changedFilename) => {
  if (eventType === 'change') {
    const message = JSON.stringify({
      type: 'changed',
      file: changedFilename || filename,
      timestamp: Date.now(),
    });

    client.publish(topic, message, (err) => {
      if (err) {
        console.error('Failed to publish message:', err);
      } else {
        console.log(`Published message to topic ${topic}: ${message}`);
      }
    });
  }
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
