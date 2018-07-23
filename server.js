var express = require('express');
const path = require('path');

var bodyParser = require('body-parser');
var cookieSession = require('cookie-session')

var app = express();
var users = require('./routes/user');
var route = require('./routes/route');

var unlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/views'));
app.set("views", __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cookieSession({
    key: 'node',
    secret: 'HelloExpressSESSION'
}))

app.use('/', users);
app.use('/', route);

app.listen(8080, function() {
    console.log('Started in 8080');
})
