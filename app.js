/**
 * Module dependencies.
 */
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var connect = require('connect');
var app = express();
var port = process.env.PORT || 8080;

// Configuration 
app.use(express.static(__dirname + '/public')); 
app.use(connect.logger('dev')); 
app.use(connect.json()); 
app.use(connect.urlencoded());

app.use(cookieParser());
app.use(session({
    secret: "aacd4d61-b4ee-4790-9faa-48236449b9d6",
    cookie: { maxAge: 7 * 24 * 3600 * 1000 }, // session expires after one week
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

// Routes  
require('./routes/routes.js')(app);  

var server = app.listen(port);
console.log('The App runs on port ' + port);

// Init Socket.io
var io = require('socket.io').listen(server);
require('./node_modules/config/chatroom.js')(io);  