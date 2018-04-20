var express = require('express');
var users = express.Router();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var unlencodedParser = bodyParser.urlencoded({ extended: false });

var AWS = require("aws-sdk");
const uuidv1 = require('uuid/v1');

AWS.config.update({
    region: "ap-northeast-2",
    endpoint: "https://dynamodb.ap-northeast-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

users.get('/login', function(req, res) {
    res.render('login.html');
    res.end();
});

//when user logs in or registers
users.post('/login', unlencodedParser, function(req, res) {
    var params = {
      TableName: "Account"
    }

    console.log("Scanning SensorGroup table.");
    docClient.scan(params, onScan);

    function onScan(err, data) {
        var login = false;
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Scan succeeded.");
            data.Items.forEach(function(accounts) {
               if (accounts.email == req.body.username && accounts.password == req.body.pwd){
                  console.log("Log in succeeded");
                  login = true;
               }
            });
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }

        if (login == true) {
            res.cookie('checker', 'login_');
            res.redirect('homepage.html');
            //res.redirect('test.html');
            //res.render('logic_control.html');
        } else {
            res.render('page_404_sign_in.html');
        }
    }
});

users.post('/register', unlencodedParser, function(req, res) {
    var d = new Date();

    var params = {
        TableName: "Account",
        Item: {
          "uuid": uuidv1(),
          "createdtime": d.getTime(),
          "email": req.email,
          "password": req.password,
          "name": req.name
        }
    }

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to register account", req.name, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", req.name);
       }
    });

    res.render('login.html');
});


users.get('/logic', function(req, res) {
    res.render('logic_control.html');
});

users.get('/test',function(req, res) {
    res.render('inbox.html');
});

module.exports = users;
