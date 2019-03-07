const fs = require('fs');

const bodyParser = require('body-parser');
var cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const filename = 'requests.json';

// Rate limiters.
const readLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour.
  max: 60,
  message: { message: 'Too many requests, please try again later.' }
});

const writeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day.
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});

// Initilize requests.
let requests;
try {
  requests = JSON.parse(fs.readFileSync(filename));
} catch (err) {
  console.warn(`Failed to open the requests file: ${err}.`);
  requests = {};
}

// Middlewares.
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/requests', readLimiter, async (req, res) => {
  let keys = Object.keys(requests);
  keys.sort((lhs, rhs) => requests[rhs] - requests[lhs]);
  res.status(200).send(JSON.stringify(requests, keys));
});

app.post('/requests', writeLimiter, async (req, res) => {
  if (!req.body.name) return res.status(422).json({ message: 'Need name.' });
  let { name } = req.body;
  name = name.trim().toLowerCase();

  let count = (requests[name] || 0) + 1;
  requests[name] = count;
  await fs.promises.writeFile(filename, JSON.stringify(requests));
  res.status(201).json({ [name]: count });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found.' });
});

app.listen(port, () => console.log(`Listening on port ${port}.`));
