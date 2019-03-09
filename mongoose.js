const mongoose = require('mongoose');

var db = mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/campnet-campus-request',
  { useNewUrlParser: true }
);

mongoose.connection.on('error', () => {
  console.error.bind(console, 'connection error:');
});
mongoose.connection.once('open', () => {
  console.log('Mongodb connected.');
});
