var sys = require('sys');
var config = require('./config').config;
var irc = require('./lib/irc');
var fs = require('fs');
var path = require('path');
var repl = require('repl');
var client = new irc.Client(config.host, config.port)
var inChannel = false;

var games = {};

// DOTS GAME
games.dots = {
  chr:false,
  chars:["!","@","#","$","%","^","&","*","(",")"],
  answer:false,
  freeze:[]
}


client.connect(config.user);


function sendchat(msg) {
  client.send()
}

client.addListener('001', function() {
  this.send('JOIN', config.channel);
});

client.addListener('JOIN', function(prefix) {
  inChannel = true;

  var user = irc.user(prefix);
  //writeLog(user+' has joined the channel');
});

client.addListener('PART', function(prefix) {
  var user = irc.user(prefix);
  //writeLog(user+' has left the channel');
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
  var cmd = text.split(" ",1)[0].toLowerCase();
  var user = irc.user(prefix);

  if(cmd=="-play") {
    var data = text.split(" ");

    if(data[1]=="dots") {
      var string = "";

      games.dots.playing= true;
      this.send('PRIVMSG', channel, ':Starting Dots..');

      if(data.length>2) {
        games.dots.chr = data[2];
      } else {
        games.dots.chr = games.dots.chars[Math.round(Math.random(games.dots.chars.length))];
      }

      games.dots.answer = Math.round(Math.random()*10)+5;
      for(var c=0;c<games.dots.answer;c++) {
        string+=games.dots.chr;
      }

      this.send('PRIVMSG', channel, ':How many we got here? ( ' + string + ')');

    }
  }

  if(text.indexOf("too big")>-1) {
    this.send("PRIVMSG", channel, ":That's what she said");
  }

  if(text.indexOf(games.dots.chr) && games.dots.playing) {

    console.log("trigged " + games.dots.chr)
    if(games.dots.playing) {
      if(games.dots.freeze.join(",").indexOf(user)<=0) {
        var a = parseInt(text.split(":")[1]);
        console.log("answer is " + a)
        if(a<games.dots.answer) {
          this.send('PRIVMSG', channel, ':' + user + ' answered ' + a + ' which is too low...');
        }
        if(a>games.dots.answer) {
          this.send('PRIVMSG', channel, ':' + user + ' answered ' + a + ' which is too high...');
        }
        if(a==games.dots.answer) {
            this.send('PRIVMSG', channel, ':' + user + ' answered ' + a + ' which is too high...');
            //redis.zincrby('scoreboard', 1, msg.user.name);
          games.dots.answer = null;
          games.dots.chr = null;
          games.dots.playing = false;
        }
        games.dots.freeze.push(user);
        setTimeout(function removeFromFreeze(user) {
          games.dots.freeze = games.dots.freeze.join("").replace(user,"");
          games.dots.freeze = games.dots.freeze.split(",");
        },3000,user);
      } else {
        this.send('PRIVMSG', channel, ':' + user + ' you are answering too fast, hold your horses')
      }
    }
  }


});

repl.start("nodebot> ").context.client = client;
