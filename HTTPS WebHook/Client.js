const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);

  const event = req.body;
  if (event.type === 'changed') {
    console.log('Handling file change event:', event.file);
  }

  res.sendStatus(200); 
});

const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server is listening on port ${PORT}`);
});
