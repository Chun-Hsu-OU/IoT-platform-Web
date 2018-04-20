var express = require('express');
var route = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var unlencodedParser = bodyParser.urlencoded({ extended: false });

route.get('/logic', function(req, res) {
    res.render('logic_control.html');
});

route.get('/test',function(req, res) {
    res.render('inbox.html');
});

route.get('/tlchou', function(req, res) {
    res.render('head.html');
});

module.exports = route;
