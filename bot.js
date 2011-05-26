var config = require('./config').config;
var irc = require('./lib/irc');
var client = new irc.Client(config.host, config.port)
var repl = require('repl');

var bot = {
  client: client,
  events: [],

  connect:function() {
    this.client.connect(config.user);
    this.client.addListener('001', function() {
      this.send('JOIN', config.channel);
    });
  },

  listen:function(keyword, callback) {
    var fn = bot.events[keyword] = {
      id: keyword,
      type: 'PRIVMSG',
      fn: function (prefix, channel, text) {
        var message = { prefix: prefix, channel: channel, text: text };
        var regex = new RegExp('('+keyword+')','im');
        if (regex.test(text)) {
          callback(message);
        }
      }
    };
    this.client.addListener('PRIVMSG', fn.fn);
  },

  ignore:function(id) {
    type = this.events[id].type
    this.client.removeListener(type, this.events[id].fn);
  },

  arrive:function(id, callback) {
    var fn = bot.events[id] = {
      id: id,
      type: 'JOIN',
      fn: function (prefix, channel, text) {
        name = prefix.split('!')[0]
        var message = { prefix: prefix, channel: channel, text: text, name: name };
        callback(message);
      }
    };
    this.client.addListener('JOIN', fn.fn);
  },

  depart:function(id, callback) {
    var thisFn = bot.events[id] = {
      id: id,
      type: 'PART',
      fn: function (prefix, channel, text) {
        name = prefix.split('!')[0]
        var message = { prefix: prefix, channel: channel, text: text, name: name };
        callback(message);
      }
    };
    this.client.addListener('PART', thisFn.fn);
  },


  send:function(text, channel) {
    if(typeof channel == 'undefined') { channel = config.channel }
    this.client.send('PRIVMSG', channel, ':' + text)
  }
}
exports.bot = bot;