var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();




// view engine setup
app.set('port',process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var users = {};

app.get('/',function(req,res){
    if(req.cookies.user == null){
      res.redirect('/signin');
    }else{
      res.sendfile('views/index.html');
    }
});

app.get('/signin',function(req,res){
    res.sendfile('views/signin.html');
});

app.post('/signin',function(req,res){
    if(users[req.body.name]){
      res.redirect('/signin');
    }else{
      res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
      res.redirect('/');
    }
});

// use socket.io
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
  socket.on('online',function(data){
    socket.name = data.user;
    if(!users[data.user]){
      users[data.user] = data.user;
    }

    io.sockets.emit('online',{users: users, user: data.user});
  });

  //define 
  function findClientsSocket(roomId, namespace) {
      var res = []
      , ns = io.of(namespace ||"/");    

      // the default namespace is "/"

      if (ns) {
          for (var id in ns.connected) {
              if(roomId) {
                  var index = ns.connected[id].rooms.indexOf(roomId) ;
                  if(index !== -1) {
                      res.push(ns.connected[id]);
                  }
              } else {
                  res.push(ns.connected[id]);
              }
          }
      }
      return res;
  }
  
  socket.on('say',function(data){
    if(data.to == 'all'){
      socket.broadcast.emit('say', data);
    }else{
      var clients = findClientsSocket() ;
      clients.forEach(function(client){
        if(client.name == data.to){
          client.emit('say',data);
        }
      });
    }
  });
  socket.on('disconnect',function(){
    if(users[socket.name]){
      delete users[socket.name];
      socket.broadcast.emit('offline',{users:users, user: socket.name});
    }
  });
  
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
