var express = require('express');
var route = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var unlencodedParser = bodyParser.urlencoded({
  extended: false
});

route.get('/homepage', function(req, res) {
  res.render('homepage.html');
});

module.exports = route;
