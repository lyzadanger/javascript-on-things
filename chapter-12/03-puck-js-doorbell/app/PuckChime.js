/* global window, Puck */
class Sound {
  constructor (url) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.url = url;
    this.context = new AudioContext();
    this.buffer = null;
  }
  load () {
    return new Promise((resolve, reject) => {
      if (this.buffer) { resolve(this.buffer); }
      var request = new window.XMLHttpRequest();
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        this.context.decodeAudioData(request.response, soundBuffer => {
          this.buffer = soundBuffer;
          resolve(this.buffer);
        });
      };
      request.send();
    });
  }
  play () {
    this.load().then(buffer => {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      source.start(0);
    });
  }
}

class PuckChime {
  constructor () {
    this.connection = null;
    this.dataBuffer = '';
    this.sound = new Sound('/chime.mp3');
  }

  init () {
    return this.connect().then(() => {
      return new Promise((resolve, reject) => {
        this.reset()
        .then(this.watchButton.bind(this))
        .then(() => {
          this.chime();
          resolve();
        });
      });
    });
  }

  connect () {
    return new Promise ((resolve, reject) => {
      Puck.connect(connection => {
        this.connection = connection;
        this.connection.on('data', this.parseData.bind(this));
        resolve(this.connection);
      });
    });
  }

  send (cmd) {
    cmd = `\x10${cmd}\n`;
    return new Promise ((resolve, reject) => {
      this.connection.write(cmd, () => { resolve(cmd); });
    });
  }

  reset () {
    return new Promise((resolve, reject) => {
      this.send('reset()').then(() => { setTimeout(resolve, 1500); });
    });
  }

  watchButton () {
    const cb = "function() { Bluetooth.println('CHIME'); LED1.set(); setTimeout(() => LED1.reset(), 250);}";
    const opts = "{repeat:true,debounce:250,edge:'rising'}";
    const cmd = `setWatch(${cb},BTN,${opts});`;
    return this.send(cmd);
  }

  parseData (data) {
    this.dataBuffer += data;
    var cmdEndIndex = this.dataBuffer.indexOf('\n');
    while (~cmdEndIndex) {
      var cmd = this.dataBuffer.substr(0, cmdEndIndex).replace(/\W/g, '');
      this.parseCommand(cmd);
      this.dataBuffer = this.dataBuffer.substr(cmdEndIndex + 1);
      cmdEndIndex = this.dataBuffer.indexOf('\n');
    }
  }

  parseCommand (cmd) {
    if (cmd.match('CHIME')) {
      this.chime();
    }
  }

  chime () {
    window.document.body.classList.add('ding');
    this.sound.play();
    window.setTimeout(() => {
      window.document.body.classList.remove('ding');
    }, 500);
  }
}
