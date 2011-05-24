// DOTS GAME
var dots = {
  chr:false,
  chars:["!","@","#","$","%","^","&","*","(",")"],
  answer:false,
  freeze:[],
  
  triggers:{
    "!play dots",function() {
      
    },
    "!quit dots",function() {
      chat.send("Killing dots")
    }
  }
  
}

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