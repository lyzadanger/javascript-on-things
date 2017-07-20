var five = require('johnny-five');
var board = new five.Board();

board.on('ready', () => {
  var tmp36 = new five.Thermometer({
    controller: 'TMP36',
    pin: 'A0'
  });
  tmp36.on('data', () => {
    console.log(tmp36.celsius);
  });
});
