'use strict';

require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.raw({limit: '5mb'}));
app.use(express.text({limit: '5mb'}));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended: true, limit: '5mb',}));

app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth, Admin-Key, Reset-Token");
  next();
});

app.use(express.static('public')); // Serve the Front-End



// Start the server
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


module.exports = app;
