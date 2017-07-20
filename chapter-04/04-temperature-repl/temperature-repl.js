var five = require('johnny-five');
var board = new five.Board();

board.on('ready', () => {
  var tmp36 = new five.Thermometer({
    controller: 'TMP36',
    pin: 'A0'
  });
  board.repl.inject({
    tmp36: tmp36
  });
});
