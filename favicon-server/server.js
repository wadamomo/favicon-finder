const cors = require('cors');
const express = require('express');
const bodyparser = require('body-parser');
const faviconController = require('./controller/faviconController');
const app = express();
const PORT = 3333;

app.use(cors());
app.use(bodyparser.json());

// db connection
const mongoose = require('mongoose');
const URI = 'mongodb://crayon:favicon1@ds147233.mlab.com:47233/favicon';
mongoose.connect(URI, () => { console.log('Connected to database...') });

// routes
app.post('/favicon',
  faviconController.getFavicon,
  (req, res) => {
    const response = { ...res.locals };
    console.log({response})
    res.status(200).json(response);
  });

app.listen(3333, () => { console.log(`Listening on ${PORT}...`); });
