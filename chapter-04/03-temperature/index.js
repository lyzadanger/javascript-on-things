const five = require('johnny-five');
const board = new five.Board();

board.on('ready', () => {
  const tmp36 = new five.Thermometer({
    controller: 'TMP36',
    pin       : 'A0'
  });
  tmp36.on('data', () => {
    console.log(tmp36.celsius);
  });
});
