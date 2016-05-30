/**
 * Module dependencies.
 */
var express = require('express');
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

var session = require("express-session")({
    secret: "aacd4d61-b4ee-4790-9faa-48236449b9d6",
    cookie: { maxAge: 7 * 24 * 3600 * 1000 }, // session expires after one week
    proxy: true,
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

app.use(session);

// Routes  
require('./routes/routes.js')(app);  

var server = app.listen(port);
console.log('The App runs on port ' + port);

// init Socket.io
var io = require('socket.io').listen(server);

// enable socket.io session support
io.use(sharedsession(session, {
    autoSave:true
}));

io.on('connection', function(socket){		
 		
     console.log('-> a user connected through socket');
 		
     socket.on('chat message', function(msg){
         console.log("-> chat message received");
         console.log(" ** session_id: " + socket.handshake.session.id);
         console.log(" ** user_id: " + socket.handshake.session.user_id);

         io.emit('chat message', msg);		
     });		
 		
     socket.on('disconnect', function(){		
         console.log('-> user disconnected from socket');
     });		
 }); 
