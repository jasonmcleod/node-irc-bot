var sys = require('sys');
var config = require('./config').config;
var irc = require('./lib/irc');
var fs = require('fs');
var path = require('path');
var repl = require('repl');
var client = new irc.Client(config.host, config.port)
var inChannel = false;

// setup configured client
client.connect(config.user);
// join client to server
client.addListener('001', function() {
  this.send('JOIN', config.channel);
});



// default listener set
client.addListener('JOIN', function(prefix) {
  inChannel = true;
  var user = irc.user(prefix);
});

client.addListener('PART', function(prefix) {
  var user = irc.user(prefix);
});

client.addListener('DISCONNECT', function() {
  puts('Disconnected, re-connect in 5s');
  setTimeout(function() {
    puts('Trying to connect again ...');

    inChannel = false;
    client.connect(config.user);
    setTimeout(function() {
      if (!inChannel) {
        puts('Re-connect timeout');
        client.disconnect();
        client.emit('DISCONNECT', 'timeout');
      }
    }, 5000);
  }, 5000);
});

client.addListener('PRIVMSG', function(prefix, channel, text) {
});

repl.start("nodebot> ").context.client = client;