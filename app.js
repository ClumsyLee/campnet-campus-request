const fs = require('fs');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const mongoose = require('./mongoose');
const Request = require('./request');

// Express server.
const app = express();
const port = process.env.PORT || 3000;

// Rate limiters.
app.enable('trust proxy');

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day.
  max: 5,
  message: { message: 'Too many requests, please try again later.' }
});

// Administration.
function adminAccess (req, res, next) {
  if (req.get('X-Admin-Secret') != process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Invalid admin secret.' });
  }
  next();
}

// Middlewares.
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoints.
app.get('/requests', adminAccess, (req, res, next) => {
  Request.find({}).exec()
    .then(requests => res.status(200).json(requests))
    .catch(err => next(err));
});

app.post('/requests', rateLimiter, (req, res, next) => {
  if (!req.body.content) {
    return res.status(422).json({ message: 'Need content.' });
  }
  let { content } = req.body;
  content = content.trim().toLowerCase();

  new Request({ ip: req.ip, content }).save()
    .then(request => res.status(201).json(request))
    .catch(err => next(err));
});

app.delete('/requests/:id', adminAccess, (req, res, next) => {
  Request.findByIdAndDelete(req.params.id).exec()
    .then(request => request ? res.sendStatus(204) : next())
    .catch(err => next());
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found.' });
});

app.listen(port, () => console.log(`Listening on port ${port}.`));
