// proxy.js
const express = require('express');
const fetch = require('node-fetch'); // Установи отдельно, если не установлен
const app = express();
const PORT = 3001;

const GOOGLE_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbzeM58wRBplumti9Zz6d-jNDEvxBF7id_fwaRUcLF1HfX8Ku6aVXhozBPpeCzIfHfJQ/exec';

app.get('/api', async (req, res) => {
  try {
    const url = `${GOOGLE_SCRIPT_BASE_URL}?${new URLSearchParams(req.query).toString()}`;
    const response = await fetch(url);
    const text = await response.text();

    res.set('Access-Control-Allow-Origin', '*');
    res.send(text);
  } catch (err) {
    console.error('Proxy-Fehler:', err);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy läuft auf http://localhost:${PORT}`);
});
